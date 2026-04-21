// Spotify Transcript Extractor - Content Script

function extractTranscript() {
  return new Promise((resolve) => {
    // Step 1: 右パネルをスクロールしてトランスクリプトを表示させる
    const aside = document.querySelector('aside.NowPlayingView');
    const scrollContainer = Array.from(aside?.querySelectorAll('*') || []).find(el => {
      const style = window.getComputedStyle(el);
      return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 50;
    });
    if (scrollContainer) scrollContainer.scrollTop = 800;

    // Step 2: 少し待ってからトランスクリプトを取得
    setTimeout(() => {
      const container = Array.from(document.querySelectorAll('button'))
        .find(b => /^\d+:\d+$/.test(b.textContent.trim()))
        ?.parentElement;

      if (!container) {
        resolve({
          success: false,
          error: 'トランスクリプトが見つかりません。\n右パネルの「聴きながら読む」セクションが表示されているか確認してください。'
        });
        return;
      }

      const elements = Array.from(container.children);
      let transcript = '';
      let lineCount = 0;

      elements.forEach(el => {
        if (el.tagName === 'BUTTON' && /^\d+:\d+$/.test(el.textContent.trim())) {
          transcript += '\n[' + el.textContent.trim() + ']\n';
        } else {
          const text = el.textContent.replace(/\s+/g, ' ').trim();
          if (text) {
            transcript += text + '\n';
            lineCount++;
          }
        }
      });

      if (!transcript.trim()) {
        resolve({
          success: false,
          error: 'トランスクリプトのテキストが空です。'
        });
        return;
      }

      resolve({
        success: true,
        transcript: transcript.trim(),
        lineCount
      });
    }, 600);
  });
}

// メッセージリスナー（popup.jsからの指示を受け取る）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    extractTranscript().then(result => sendResponse(result));
    return true; // 非同期レスポンスのために必要
  }
});

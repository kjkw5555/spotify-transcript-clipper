// Spotify Transcript Extractor - Popup Script

const btnExtract = document.getElementById('btnExtract');
const statusLoading = document.getElementById('statusLoading');
const statusError = document.getElementById('statusError');
const statusSuccess = document.getElementById('statusSuccess');
const successText = document.getElementById('successText');
const transcriptBox = document.getElementById('transcriptBox');
const transcriptContent = document.getElementById('transcriptContent');
const transcriptMeta = document.getElementById('transcriptMeta');
const btnCopy = document.getElementById('btnCopy');
const hint = document.getElementById('hint');

let currentTranscript = '';

function setStatus(state) {
  statusLoading.style.display = 'none';
  statusError.style.display = 'none';
  statusSuccess.style.display = 'none';

  if (state === 'loading') {
    statusLoading.style.display = 'flex';
  } else if (state === 'error') {
    statusError.style.display = 'block';
  } else if (state === 'success') {
    statusSuccess.style.display = 'flex';
  }
}

function renderTranscript(text) {
  // タイムスタンプに色付けして表示
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[(\d+:\d+(?::\d+)?)\]/g, '<span class="ts">[$1]</span>');
  transcriptContent.innerHTML = html;
}

function countLines(text) {
  return text.split('\n').filter(l => l.trim() && !l.startsWith('[')).length;
}

btnExtract.addEventListener('click', async () => {
  btnExtract.disabled = true;
  hint.style.display = 'none';
  transcriptBox.classList.remove('visible');
  setStatus('loading');

  try {
    // アクティブタブを取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes('open.spotify.com')) {
      setStatus('error');
      statusError.textContent = 'Spotifyのページで実行してください。\nhttps://open.spotify.com/';
      btnExtract.disabled = false;
      return;
    }

    // content.js にメッセージ送信
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });

    if (result.success) {
      currentTranscript = result.transcript;

      const lineCount = countLines(currentTranscript);
      transcriptMeta.innerHTML = `<span>${lineCount}</span> 行 取得`;

      renderTranscript(currentTranscript);
      transcriptBox.classList.add('visible');

      setStatus('success');
      successText.textContent = `${lineCount} 行のトランスクリプトを取得しました`;
    } else {
      setStatus('error');
      statusError.textContent = result.error;
      hint.style.display = 'block';
    }
  } catch (err) {
    setStatus('error');
    if (err.message?.includes('Could not establish connection')) {
      statusError.textContent = 'ページを再読み込みしてから試してください。\n(Content Scriptが接続できませんでした)';
    } else {
      statusError.textContent = 'エラー: ' + err.message;
    }
    hint.style.display = 'block';
  }

  btnExtract.disabled = false;
});

btnCopy.addEventListener('click', async () => {
  if (!currentTranscript) return;

  try {
    await navigator.clipboard.writeText(currentTranscript);
    btnCopy.classList.add('copied');
    btnCopy.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      コピー済
    `;
    setTimeout(() => {
      btnCopy.classList.remove('copied');
      btnCopy.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2"/>
          <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" stroke-width="2"/>
        </svg>
        コピー
      `;
    }, 2000);
  } catch (err) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = currentTranscript;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
});

# Spotify Transcript Clipper

> [English version here](README.md)

Spotifyポッドキャストの「聴きながら読む」パネルからトランスクリプトを抽出し、クリップボードにコピーするChrome拡張機能です。

## 機能

- 「聴きながら読む」パネルのトランスクリプトをワンクリックで取得
- タイムスタンプ付きでポップアップに表示
- 全文をクリップボードにコピー

## インストール

1. このリポジトリをクローンまたはZIPダウンロード
2. Chrome で `chrome://extensions/` を開く
3. **デベロッパーモード** を有効にする
4. **「パッケージ化されていない拡張機能を読み込む」** をクリック
5. このディレクトリを選択

## 使い方

1. Spotify Web (`open.spotify.com`) でポッドキャストを開く
2. 右パネルの「聴きながら読む」を表示する
3. ツールバーの拡張機能アイコンをクリック
4. **「トランスクリプトを取得」** ボタンを押す
5. 取得されたテキストを確認し **「コピー」** する

## アーキテクチャ

```
popup.js  →  chrome.tabs.sendMessage({ action: 'extract' })  →  content.js
                                                                      ↓
popup.js  ←  sendResponse({ success, transcript, lineCount })  ←
```

| ファイル | 役割 |
|---|---|
| `content.js` | Spotifyページに注入。DOMからトランスクリプトを抽出 |
| `popup.js` | ポップアップUI。content.jsへのメッセージ送受信とコピー処理 |
| `popup.html` | ポップアップのUI（インラインCSS、ビルド不要） |
| `manifest.json` | Manifest V3 設定 |

## 注意事項

- SpotifyのDOM構造変更により動作しなくなる場合があります
- 主な破損ポイント: `aside.NowPlayingView` セレクタとタイムスタンプボタンの検出ロジック

## 権限

| 権限 | 用途 |
|---|---|
| `activeTab` | アクティブタブへのアクセス |
| `scripting` | content scriptの実行 |
| `clipboardWrite` | クリップボードへのコピー |
| `https://open.spotify.com/*` | Spotifyページへの限定アクセス |

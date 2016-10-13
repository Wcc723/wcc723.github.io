---
layout: post
title: 更棒的 Jekyll 編寫工具
category: tools
tagline:
tags: [tools, jekyll]
cssdemo:
jsdemo:
thumbnail: 2015/11/open-source-ddd56f69d6e1b5bd2c1b44b0db1d2a6c.jpg
published: true
---

這個Blog也維持很長一段時間了，曾經會想要放棄維護轉到其它平台，主要原因是Jekyll上稿有些麻煩的地方，其中一項最痛的就是上圖...。在上圖之前，都必須先將圖片放到`/images`，接下來再手動寫相對位置，如果圖片要換，就必須再打開`/images`資料夾，一來一往必須花很多時間。

最近發現了**Atom**編輯器有套件可以自動把圖片搬移到該資料夾，並且還有許多Jekyll的輔助功能，讓我可以更專注於Blog的文章內容。

如果您跟我一樣是 Jekyll 的使用者，相信你會很喜歡這編輯工具。

*圖片來自於 Atom 官網*

<!-- more -->

## 如何使用

在開始前，必須先安裝`Atom`，這是Github所開發的編輯器，大致上與 `sublime text 3` 相當接近，但對於套件的管理更為直覺，而且還可以容易的安裝各種 Theme(?。本篇就是要介紹他其中一個套件`Markdown-Writer`。

- 安裝 Atom
- 安裝 Markdown-Writer

所以先到[Atom](https://atom.io/)的官網下載 `Atom` 安裝吧。

## 安裝 Markdown-Writer

Atom 的使用相當直覺，只要直接選擇 `Perferences(cmd + ,)`就可以打開設定，其中就可以找到套件安裝(Install Packages)，如下圖就可以搜尋到`Markdown-Writer`，再按下 install 就會開始安裝(這邊我已經裝囉)。

![搜尋並安裝markdown writer](/images/2015/11/Settings_-__Users_oushimakoto_github_wcc723_github_io_-_Atom.png)

## 設定 Markdown-Writer

設定最重要的...Blog路徑，這如果沒有設定，等等也玩不下去。一樣在設定內可以找到 `Packages`，列表上可以找到剛剛安裝的 `Markdown-Writer`。

![](/images/2015/11/Settings_-__Users_oushimakoto_github_wcc723_github_io_-_Atom2.png)

`Site Local Directory` 這就是必要的設定，這請填入 Jekyll Blog 的本地位置。

![](/images/2015/11/Settings_-__Users_oushimakoto_github_wcc723_github_io_-_Atom3.png)

在開始使用前，在介紹一下快捷鍵的設置。在 command(`cmd + shift + p`) 執行 `Markdown Writer: Create Default keymaps`。

![](/images/2015/11/screen_shot 2015-11-25_0.png)

再把下面的 `code` 找地方貼進去，這樣就可以運行 `Markdown Writer` 所提供的快捷鍵。


    ".platform-darwin atom-text-editor[data-grammar~='gfm']":
      "shift-cmd-K": "markdown-writer:insert-link"
      "shift-cmd-I": "markdown-writer:insert-image"
      "cmd-i":       "markdown-writer:toggle-italic-text"
      "cmd-b":       "markdown-writer:toggle-bold-text"
      "cmd-'":       "markdown-writer:toggle-code-text"
      "cmd-k":       "markdown-writer:toggle-keystroke-text"
      "cmd-h":       "markdown-writer:toggle-strikethrough-text"
      "ctrl-alt-1":  "markdown-writer:toggle-h1"
      "ctrl-alt-2":  "markdown-writer:toggle-h2"
      "ctrl-alt-3":  "markdown-writer:toggle-h3"
      "ctrl-alt-4":  "markdown-writer:toggle-h4"
      "ctrl-alt-5":  "markdown-writer:toggle-h5"
      "shift-cmd-O": "markdown-writer:toggle-ol"
      "shift-cmd-U": "markdown-writer:toggle-ul"
      "shift-cmd->": "markdown-writer:toggle-blockquote"
      'shift-cmd-"': "markdown-writer:toggle-codeblock-text"
      "cmd-j cmd-p": "markdown-writer:jump-to-previous-heading"
      "cmd-j cmd-n": "markdown-writer:jump-to-next-heading"
      "cmd-j cmd-d": "markdown-writer:jump-between-reference-definition"
      "cmd-j cmd-t": "markdown-writer:jump-to-next-table-cell"

## 使用 Markdown-Writer

在建立一個 Markdown 的檔案後，就可以嘗試插入圖片 `cmd + shift + i`，選擇圖片後，再勾選 `Copy Image to Site Image Directory`，這樣就能夠把其他位置的圖片直接移動到`/images`資料夾內，並且會自動新增 `年/月` 資料夾。

![](/images/2015/11/2015-11-25-better-jekyll-markdown-editor_md_-__Users_oushimakoto_github_wcc723_github_io_-_Atom4.png)

(光是這個功能就足以讓我痛哭流涕...)

其他功能在使用時會感受到，例如：

- 程式碼標記自動插入頭尾 (\`)
- 快捷鍵控制各種文字標記 ex: `cmd + h` 文字加入刪除線
- 還有超多功能可以在設定裡找到...(太多了，記不住)

## Markdown-Writer 可能出現的錯誤

在第一次使用時，可能是Atom版本較舊，所以出現錯誤，這時候建議先更新Atom，並且先 `Disabled` 套件後解除安裝，再重新安裝 `Markdown-Writer` 套件。

![](/images/2015/11/Settings_-__Users_oushimakoto_github_wcc723_github_io_-_Atom4.png)

這段時間也研究了很多部落格平台，考慮的原因也很多，最後決定繼續維護目前的 Jekyll，原因有下：

- 平台的 Editor 是否好用，難寫的根本撐不下去 (超重要)
- 平台的費用，平台是否有另外買網址的必要 (github.io 根本潮)
- 平台的使用者數量 (Jekyll 有 Github 罩)
- 不論用哪種平台，都必須思考平台未來的發展 (什麼時候會消失，文章是否能匯出)

基於這些原因，最後還是認為 Jekyll 適合我，也因此特別將Blog版型更新了一翻(雖然還有很多Bug Q_Q)...。

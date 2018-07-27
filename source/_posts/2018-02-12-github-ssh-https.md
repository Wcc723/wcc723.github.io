---
layout: post
title: Github 中的 ssh、https 路徑有什麼差異？ - 如何設定 Github SSH 金鑰
category: git
tagline:
tags: [git]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2Fgithub-ssh.jpg?alt=media&token=64417bac-8ddd-406c-809d-e1f4c1083f99
published: true
---

再推出[ Hexo 介紹影片](https://www.facebook.com/WccCasper/videos/486603828402512/)以後，會有許多同學私下問我關於 `https` 與 `ssh` 這兩個有什麼差異？另外會不會影響部署？為什麼看老師是使用 `ssh` 而自己用 `ssh` 卻跳出權限不足？

## Git 中 `https` 與 `ssh` 這兩個有什麼差異？

這兩個均是 Git 儲存庫的路徑，Github 官方推薦使用 `https` 但同時也提供 `ssh` 的連線方式，兩者差異點在於：

- `https`: 在上傳時需要輸入帳密，如果不需要大多是帳密(Key Chain)已存在電腦內。
- `ssh`: 已先在電腦內設定好金鑰，上傳時不需要輸入額外帳密。

所以這個僅是上傳的路徑，所以選擇哪一個都不會影響最終上傳的結果或是 Hexo 部署的結果喔。而我使用 `ssh` 也是因為有先設定好金鑰，如果沒有設定金鑰也就會跳出權限不足的字樣喔。

## 如何設定 Github SSH 金鑰

[Github: 使用 SSH 連線相關文章](https://help.github.com/articles/connecting-to-github-with-ssh/)

本篇文章以 Mac 的為主，如果你使用的是其它作業系統，上述文章也有詳細描述，整體差異不會太大喔。金鑰本身是一對的一個公鑰及一個私鑰，流程會是在本地端產生一組公私鑰，然後將公鑰上傳到 Github 上，接下來再上傳儲存庫時 Github 就會透過公鑰與電腦中的私鑰比對驗證，藉此不需要再輸入帳密。

### 步驟一：產生金鑰

輸入以下指令，來產生新的 SSH Key。

```shell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8810_59.png?alt=media&token=ccac64a2-8c4e-4499-9cf5-f005304029ff)

```shell
$ Enter file in which to save the key (/Users/casper/.ssh/id_rsa):
# 這行只是確定存在哪
$ Overwrite (y/n)?
# 如果原本就有金鑰會跳出此問題，覆蓋嗎？ (是)
$ Enter passphrase (empty for no passphrase):
$ Enter same passphrase again:
# 輸入密碼
```

此密碼與 Github 密碼無關，只是使用這個金鑰的密碼，為了寫這篇文章，我真的覆蓋了 Q_Q

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8811_08.png?alt=media&token=e1252b33-503f-43fb-a423-244e9f2604bb)



### 步驟二：設定金鑰代理 (Adding your SSH key to the ssh-agent)

啟用 SSH 代理伺服器，這個步驟可以讓之後使用此金鑰不需要再輸入額外的密碼(剛剛的自訂密碼)，如果跳過此步驟，之後就要輸入自訂密碼。

```shell
$ eval "$(ssh-agent -s)"
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8811_16.png?alt=media&token=f2670aff-8186-4dde-91c5-09293e272709)

將私鑰及加入到 SSH 代理上，並且同時儲存剛剛的自訂密碼：

```shell
$ ssh-add -K ~/.ssh/id_rsa
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8811_20.png?alt=media&token=9e28a98b-4fe2-4e39-8968-39ec344d2c4c)

### 步驟三：上傳公鑰

Mac 內的個人目錄下可以找到 `.ssh/` 資料夾，以下會分別有 `id_rsa`、`id_rsa.pub` 兩個檔案，也分別為私鑰及公鑰，此步驟就是將 `id_rsa.pub` 檔案的內容上傳到 Github 上。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8B%E5%8D%881_14.png?alt=media&token=99ec8f46-1e61-4ec6-889e-86daf3fe5f24)

請用文字編輯器打開以上檔案並複製其內容。接下來到 Github > Settings > SSH and GPG keys 的設定頁面，選擇 New SSH Key。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8811_56.png?alt=media&token=8da055e9-d2f6-4f12-a5dd-576a113486c5)

接下來會出現設定頁面，上方標題可以自訂名稱，下方則可以貼上剛剛所複製的 Key，都確定後再輸入 Github 密碼則完成綁定，

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8A%E5%8D%8811_59.png?alt=media&token=4a87c4ee-ea63-45cc-8c55-255e53e40066 )

然後進行一次 `git push`，如果可以進行推送就完成了，在剛剛所設定頁面重新整理後也會看到 `Last used within the last week` 最近一週有使用的字眼。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201802%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_2_13_%E4%B8%8B%E5%8D%881_19.png?alt=media&token=191290b5-a5d7-4b80-86b3-39dd6bcf20b9)

雖然官方是推薦使用 `https`，但不用輸入帳密真的很方便。

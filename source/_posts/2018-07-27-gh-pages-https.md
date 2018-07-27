---
layout: post
title: Github Pages 自訂網域免費升級 https
category: design
tagline:
tags: [tools]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201807%2F55126281-E541-48B1-96EE-7EC17EB08025.png?alt=media&token=2581daab-6369-4339-a76e-96a2f823f00d
published: true
---

Chrome 在 68 版以後會將沒有 https 連線的網站標上不安全的字樣，如果使用 Github Pages 但又不想花大錢買憑證的朋友，可以參考本篇免費安裝 https 憑證。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201807%2F6E5E0DEC-4CE4-4C6B-9834-CD3595D26A1B.png?alt=media&token=59fdca71-c107-4e65-af4a-698e3d8c745a)

現在 Github Pages 免費提供自訂網域核發 HTTPS 憑證，且這段流程是完全自動，不需要額外申請，雖然是全自動的，但也需要符合規範才能自動申請。

## 需要注意的地方

憑證是 Github 代為與 Let's Encrypt  申請，主要也是推廣 https 的使用。如上所述，申請的流程是完全自動，只要完成以下兩個條件 Github 就會自動申請，並且選擇可免費使用 https (憑證約可使用三年)。

### Domain 指向的 ip 替換

過去 Github pages domain 設定使用的 ip 是兩組 "192" 開頭的 ip，目前這兩組依然可以運作，但如果需要自動申請 https 則需要將 domain 指向的 ip 替換成以下四組。

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

建議先將 ip 替換好並過一小時後再進行以下流程，稍後會說明原因。

### 網頁中的所有資源，都必須是 https

設定完 ip，可以將網頁中的所有資源 (css、js、圖片、外部連結等等) 全部替換成 https，並且重新上傳至 Github Pages 中，至於相關的替換可以參考 Github 的[說明文件](https://help.github.com/articles/securing-your-github-pages-site-with-https/) (如下所示)：

{% raw %}
<table>
<thead>
<tr>
<th align="center">Asset type</th>
<th align="center">HTTP</th>
<th align="center">HTTPS</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">CSS</td>
<td align="center"><code>&lt;link rel="stylesheet" href="http://example.com/css/main.css"&gt;</code></td>
<td align="center"><code>&lt;link rel="stylesheet" href="https://example.com/css/main.css"&gt;</code></td>
</tr>
<tr>
<td align="center">JavaScript</td>
<td align="center"><code>&lt;script type="text/javascript" src="http://example.com/js/main.js"&gt;&lt;/script&gt;</code></td>
<td align="center"><code>&lt;script type="text/javascript" src="https://example.com/js/main.js"&gt;&lt;/script&gt;</code></td>
</tr>
<tr>
<td align="center">Image</td>
<td align="center"><code>&lt;A HREF="http://www.somesite.com"&gt;&lt;IMG SRC="http://www.example.com/logo.jpg" alt="Logo"&gt;&lt;/a&gt;</code></td>
<td align="center"><code>&lt;A HREF="https://www.somesite.com"&gt;&lt;IMG SRC="https://www.example.com/logo.jpg" alt="Logo"&gt;&lt;/a&gt;</code></td>
</tr>
</tbody>
</table>
{% endraw %}

接下再到 Github 專案中如下圖的設定頁面。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201807%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_7_27_%E4%B8%8B%E5%8D%883_41.png?alt=media&token=b4970987-ce79-4b95-a3c6-083cc5777b5f)

圖片中的回饋訊息是已經正確完成的，目前我所知道回饋訊息有三種 (我僅記得大概意思，忘記截圖了 orz)：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201807%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_7_27_%E4%B8%8B%E5%8D%883_43.png?alt=media&token=27d43de8-efa2-43c7-a93f-5a59575e2d52)

1. 網頁不符合 https 規範，所以無法開啟 https (無法 checked 核取方塊)，並且會提供[連結](https://help.github.com/articles/securing-your-github-pages-site-with-https/) 說明修改事項。
	- 如果沒有先換 ip 也會一直卡在這個階段，會較難判斷是資源沒有替換完整或是 ip 沒有換，因此建議先替換 ip 再更新網站。
2. 憑證核發中， 24 小時內即可完成 (無法 checked 核取方塊)
	- 到這個步驟就算完成了，雖然文件是寫 24 小時，但是約 2 ~ 4 小時就可以完成。
3. HTTPS provides a layer of encryption that prevents others from snooping on or tampering with traffic to your site.
	- 完成，此時可以直接使用 `https://` 進入所申請的網址，並且 http 也依然可以繼續使用，如果選擇 `Enforce HTTPS` 進入網站會自動導向 https。 (開啟後也須等待一段時間)

下圖是最終完成的示意圖：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201807%2F7042B39A-C6C5-434E-9CFD-9191D1374767.png?alt=media&token=31fb2b57-bd4c-4d82-a235-d7c91b8f8f77)

範例網站：https://bootstrap.hexschool.com/
---
layout: post
title: 讓使用者愛上你的表單，提升客戶轉換率
category: study
tagline:
tags: [study]
cssdemo:
jsdemo:
thumbnail: 2016/04/3765c625.jpg
published: true
---

不知道你們在使用手機填寫表單的時候，會發現這樣的狀況，填寫地址跳出中文、填寫 E-mail 表單跳出中文、填寫電話也是跳出中文，甚至是日期欄位也是跳出中文，這樣其實對於使用者來說是很不便利的。如果這個狀況發生在結帳前，很高的機率導致使用者失去耐心，甚至離開網站，如果在表單上多花點小心思，就可以讓使用者快速地填完表單，讓雙方都滿意這次的交易。

<!-- more -->

如這一個範例來說，當下所點擊的是電話號碼這個欄位，但跳出的是英文鍵盤，必須在切換後才能顯示數字鍵，好在這個表單的欄位並不多，只要切換一兩次就填完表單了。但如果這個狀況發生在電子商務類型的網站上後果可不僅於此，每個不順暢的流程都會造成用戶的猶豫、不耐煩，在大量的表單需要填寫的情況下，就可能使用戶離開。

<img src="/images/2016/04/IMG_0557.png" width="60%">

為了避免用戶不愉快造成訂單的遺失，正確的表單類型是很重要的，所以在不同需求的欄位，就必須給予正確的類型，如以下範例來說，欄位中的需求是填入電話號碼，將 `<input>` 內的 `type="text"` 修改成 `type="tel"`，在行動版所跳出的迷你鍵盤也就會以數字的格式呈現，並且是符合電話撥打的鍵盤。

![](/images/2016/04/IMG_0560.png)

電話號碼僅是其中一項，電子郵件、密碼、日期、時間都有相對應的類型，在不同格式下所顯示的螢幕小鍵盤都不同，大家不妨透過以下範例試試看在您的手機會提供什麼樣的小鍵盤。

<p data-height="500" data-theme-id="0" data-slug-hash="MyBbex" data-default-tab="html,result" data-user="Wcc723" data-embed-version="2" class="codepen">See the Pen <a href="Input" target="blank" rel="noreferrer">http://codepen.io/Wcc723/pen/MyBbex/">Input (http://codepen.io/Wcc723/pen/MyBbex/) type</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

*如果你是在行動版上觀看此原始碼，可以點選 `result` 來顯示範例*

有發現吧，有些欄位所提供的都是英文小鍵盤，但其實細節卻不大一樣，如果是 E-mail 類型的欄位就會提供 '@'，在 Url 類型的欄位則會提供 '.com'。

![](/images/2016/04/IMG_0559.png)

## Google 表單類型說明文件

至於什麼樣的內容要用什麼樣的輸入類型呢？

Google 提供了一份文件，讓網頁的開發者可以輕鬆的了解什麼樣的類型是最佳的選擇，Google文件：[選擇最佳輸入類型](https://developers.google.com/web/fundamentals/design-and-ui/input/forms/choose-the-best-input-type?hl=tw)

但同時我們也必須注意，並非所有的瀏覽器、手機均支援以上的類型，如 color (顏色類型)就不是所有瀏覽器均支援，在開發時需要經過測試，確認表單的類型是否能提供該網頁最好的瀏覽體驗。

背景圖片來源：[https://unsplash.com/photos/VGOiY1gZZYg](https://unsplash.com/photos/VGOiY1gZZYg)

歡迎分享

> Facebook：[https://www.facebook.com/hexschool/](https://www.facebook.com/hexschool/)
>
> 六角學院網站：<a href="http://www.hexschool.com/" target="_blank" class="fbp-link" data-fbp="LinkToHexschool">http://www.hexschool.com/</a>

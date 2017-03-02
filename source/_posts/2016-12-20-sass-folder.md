---
layout: post
title: 鐵人賽 20 - Sass 資料夾結構
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 
published: true
---

對於 Bootstrap 有一定了解後，我們即將要開始新增元件，不過在新增前我在分享一下 Sass 開發時的資料結構。

Sass 資料夾結構相信大家也聽說 SMACSS 等，不過我們我們已經加入了 Bootstrap ，在開發時也要思考如何結合不同的開發概念 (自己的元件與 Bootstrap 元件的結合)，並且還有往後的 Bootstrap 框架更新、專案的樣式更新等問題。

<!-- more -->

## 以元件為主的開發觀念

直觀的概念下，樣式通常會是用到哪寫到哪，這樣的開發下 CSS 的可用性較低，且開發到後期，前期的樣式都不太會再次使用(甚至不敢修改)，所以如果在開發時以元件作為出發點，就可以避免樣式可用性不高的問題。

架構參考：[http://www.sitepoint.com/architecture-sass-project/](http://www.sitepoint.com/architecture-sass-project/)

這架構是我很喜歡的 Sass 開發架構，目前開發都是以此為基礎作延伸，但由於會搭配 Bootstrap 所以還是略有調整。

這架構也並非每次都全開，會依據專案需求來做調整(用到哪開到哪)，以 layout、pages 來說，開發都是以元件為基礎，不太會使用到 layout 及 pages，所以這兩個資料夾開啟的機率不高(這兩者通常會用在活動型的網頁)。

```shell
sass/
|
|– base/
|   |– _reset.scss       # Reset/normalize
|   |– _typography.scss  # Typography rules
|   ...                  # Etc…
|
|– components/
|   |– _buttons.scss     # Buttons
|   |– _carousel.scss    # Carousel
|   |– _cover.scss       # Cover
|   |– _dropdown.scss    # Dropdown
|   |– _navigation.scss  # Navigation
|   ...                  # Etc…
|
|– helpers/
|   |– _variables.scss   # Sass Variables
|   |– _functions.scss   # Sass Functions
|   |– _mixins.scss      # Sass Mixins
|   |– _helpers.scss     # Class & placeholders helpers
|   ...                  # Etc…
|
|– layout/
|   |– _grid.scss        # Grid system
|   |– _header.scss      # Header
|   |– _footer.scss      # Footer
|   |– _sidebar.scss     # Sidebar
|   |– _forms.scss       # Forms
|   ...                  # Etc…
|
|– pages/
|   |– _home.scss        # Home specific styles
|   |– _contact.scss     # Contact specific styles
|   ...                  # Etc…
|
|– themes/
|   |– _theme.scss       # Default theme
|   |– _admin.scss       # Admin theme
|   ...                  # Etc…
|
|– vendors/
|   |– _jquery-ui.scss   # jQuery UI
|   ...                  # Etc…
```


而我的開發流程就是依據以上再作為調整，開發的心法如下

1. `all.scss` 載入開發模組 (Bootstrap 或自行開發的模組庫)。
2. 透過 helper 內的變數重新定義專案專屬的變數。
3. 增加專案所需要的元件 (元件庫所缺乏的元件)。
4. 增加區域性的元件如 header、footer (這部分的元件有可能再轉換成 components)。
5. 依據頁面需求撰寫 Pages 的 css。
6. 撰寫權限用的主題
7. 如果有載入外部 Javascripts ，會將外部的Javascript 的 css 檔名改成 `_xxxx.scss` 丟到vendors。

![](/images/2016_ironman/20_sass_01.png)

## 結語

大多情況下，我都是以 `all.scss`、`/helpers/`、`/components/` 作為開場，如果是中小型的專案甚至從頭到尾的架構都是如此，大家也可以試試看用這個架構作為開發，可以從中思考到很多 CSS 架構管理的方法，以減少大型專案的樣式失控的問題。

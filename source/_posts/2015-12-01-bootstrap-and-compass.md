---
layout: post
title: 客製化屬於你的 Bootstrap 4
category: sass
tagline: 透過Compass 以及 Gulp
tags: [bootstrap, sass, gulp, compass]
cssdemo:
jsdemo:
thumbnail: 2015/12/screen_shot_2015-12-01_01.png
published: true
---

Bootstrap 是目前最流行的CSS Framework，第四版也釋出了開發版本，無論第幾版對於工程師來說 Bootstrap 就是那麼的容易上手，但扯上設計就要多多配合了，不同身份看待 Bootstrap 也有不同看法，例如：

- 設計師：Bootstrap 很醜誒，你看那個濁濁的顏色 (當然每個設計師觀點不同啦...)。
- 前端：Bootstrap 要配合設計師的稿，似乎有點麻煩...(看著對不上的Grid system)。
- 後端：不是都長一樣嗎？

其實Bootstrap的設定檔就有許多細節可以調整，不需要 Overwite，載入前就可以先調整，而且並不是一定要全部元件載入，可以只使用部分的元件，靈活的使用框架，才能發揮更大的價值。

<!-- more -->

## 如何開始

這個範例會使用 `Node.js`, `Gulp`, `Compass` 所以請先確定有以上環境，其中最重要的是 `Compass`，有Compass環境，也是可以達到相同的效果。

*本篇範例需要以下環境*

- Ruby compass 1.0 +
- Node.js
- Bower
- Gulp

## 先運行一次，從中瞭解運作

認真的範例：[https://github.com/Wcc723/gulp-compass-bootstrap-demo](https://github.com/Wcc723/gulp-compass-bootstrap-demo)

下載這個範例，目前的結構如下：

    |- package.json      # gulp 的套件管理
    |- gulpfile.js       # gulp 執行檔案
    |- config.rb         # compass 設定檔 (重要)
    |- bower.json        # Bower 套件管理 (載入Bootstrap)
    |- source            # 專案資料夾    
        |- index.html    # 範例檔
        |- scss          # sass 範例檔
            |- all.scss
            |- helper
                |- variables.scss # Sass 設定檔

在`nodejs`環境下執行以下指令

    $ npm install
    $ bower install
    $ gulp

檔案結構改變如下

    |- package.json      # ---
    |- gulpfile.js       # ---
    |- config.rb         # ---
    |- bower.json        # ---
    |- bower_components  # Bower 下載的套件資料夾 (Bootstrap, Jquery)
    |- node_modules      # node 模組資料夾，這個範例主要是 gulp
    |- source            # ---   
        |- index.html    # ---
        |- scss          # ---
    |- public            # ** 編譯完的檔案夾 **
        |- index.html    # copy 過來的
        |- stylesheets   # 編譯後的 CSS 在這
        |- js            # jQuery.js 與 Bootstrap.js 的合併檔

接下來打開`/public/index.html`可以看到主色被改成 `purple`，這就是被調整`變數`後的 Bootstrap，通常網站的設計都會有一個主要色，只要調整`_variables.scss`中的 `$brand-primary`，就可以定義Bootstrap的主要顏色。

![](/images/2015/12/screen_shot_2015-12-01_01.png)

> 針對一個變數($brand-primary)調整，按鈕的顏色從藍色被修改成紫色。

#### 打開 `config.rb`

載入 bower bootstrap 的關鍵在於`config.rb`內的 `additional_import_paths`，這是 compass 載入外部 sass 檔案的方法，透過這個方法引用 Bootstrap 就像是本地端資料夾引用一樣。

    # 匯入 Bootstrap v4
    additional_import_paths = "./bower_components/bootstrap/scss/"


## 調整變數

Bootstrap 的變數在 `bower_components\bootstrap\scss\_variables.scss`，直接複製此檔案到 `source\scss\` 內。

*我的習慣架構是放在 `source\scss\helpers\_variables.scss`。*

以基本色彩來說，原始檔案內會有`變數 + 值 + !default`，修改只要加入新的值，並移除 `!default` 即可。

```scss
$brand-primary:             #0275d8 !default;
$brand-success:             #5cb85c !default;
$brand-info:                #5bc0de !default;
$brand-warning:             #f0ad4e !default;
$brand-danger:              #d9534f !default;
```

接下來可以看看範例檔案，我調整了其中一個顏色，再載入後，Sass 就會以我的設定檔為優先去編譯它。

*m...，其實我是打算顏色全部換掉，後來發現我只加了紫色。*

```scss
$brand-primary:             purple;
$brand-success:             #5cb85c;
$brand-info:                #5bc0de;
$brand-warning:             #f0ad4e;
$brand-danger:              #d9534f;
```

當會修改顏色以後，可以在看Bootstrap有提供多少的變數供修改。

<div style="overflow-y: auto; height: 450px;">
<script src="https://gist.github.com/Wcc723/de2942e7341cdf210c6d.js"> </script>
</div>

*注意：這份是複製檔，並非最新版 Bootstrap的設定檔*

## 自定載入元件

Bootstrap 是一個良好`OOCSS`範例，所有的CSS元件都模組化，基本上分為以下幾大類型。

- 變數 (Core variables and mixins)：這邊是基本設定，建議載入
- 重置 (Reset and dependencies)：主要是讓HTML標籤樣式一致，建議載入，有需求可透過變數修改
- 核心 CSS (Core CSS)：主要、常用的 CSS
- 元件 (Components)：基於核心或是Web經常使用的CSS元件，可以選擇是否載入
- JavaScript 套件 (Components w/ JavaScript)：好用的 Bootstrap js 套件，如果沒有需求可以不載入
- 雜項 (Utility classes)：主要是單一的CSS樣式，建議載入

接下來再打開 `source\scss\all.scss`，Sass載入 Bootstrap 的方式也有兩種，一種是全部載入，另一種是載入特定元件。

*如果要移除不要的元件，請選擇方法二，並將不要的元件直接刪除或是註解即可*

```scss
// import 自己的變數
@import "helpers/variables";


// **** 方法一：載入全部的Bootstrap 4 **** //
//
// @import "bootstrap";


// **** 方法二：自選要的元件 **** //
//
// Core variables and mixins
@import "variables";
@import "mixins";

// Reset and dependencies
@import "normalize";
@import "print";

// Core CSS
@import "reboot";
@import "type";
@import "images";
@import "code";
@import "grid";
@import "tables";
@import "forms";
@import "buttons";

// Components
@import "animation";
@import "dropdown";
@import "button-group";
@import "input-group";
//...... 略
```

Bootstrap 是很重視行動版的框架，但有時在行動版上，有時少可以再更少，如果想減少載入的 CSS 不妨從元件、js套件上開始移除。

## 優缺點

這樣做法可以節省大量的時間，並且減少CSS的錯誤(相容性、延展性等等)，但有些問題也是必須去思考：

#### 優點：

- 快速建置
- 相對穩定
- 減少對不上的問題 (相信很多人有 input 和 button 對不上的問題)
- 工程師套用容易

#### 缺點

- 環境建置學習成本較高
- 雖然可以自訂，但想法容易被侷限
- 必須花一定的時間成本學習 Bootstrap (尤其是需要自定義元件時)

Bootstrap 4 觀察了一段時間，裡面許多的概念很喜歡，包括 flex、navbar、Utilities 這些的改進...，當然更重要的是從LESS轉到SASS(雖然他用的是node sass lib，但我總是用 ruby sass 去載入)。

不過也有一點真心覺得麻煩，就是他的單位許多改成用`rem`，`em`、`rem`、`px`轉來轉去，我不是數學腦啊!!!

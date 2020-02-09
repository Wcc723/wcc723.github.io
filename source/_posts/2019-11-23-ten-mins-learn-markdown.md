---
layout: post
title: 十分鐘快速掌握 Markdown
category: development
tagline:
tags: [markdown, develop]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2Fmarkdown.png?alt=media&token=845799e3-46dd-47ce-8a49-aab12e5c4160
published: true
---

Markdown 是目前非常普遍用來撰寫文檔的語言，一開始的目標就是使用「易讀易寫的純文字格式編寫文件」，此初衷讓使用者可以專注在文字的本身，而不需要透過其它工具來切換格式。以 Word 撰寫文檔來說，就必須透過上方的工具列來切換**標題、列表、粗體、斜體**等等；而 Markdown 並沒有這樣的工具列，完全都是**使用標示符號來完成這些需求**。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F9393649C-A1ED-49BF-81F5-49EFD30924C3.png?alt=media&token=addd2eb8-077a-4a66-a644-b79b7a19b19a)

## 常見應用

大部分情況下 Markdown 是用來撰寫程式語言相關的文檔，因為純文字的特性與程式碼一致，且可搭配標示符號來改變呈現格式，像是在 Github 的文件中使用 `readme.md` 的 Markdown 格式，則會預設作為該儲存庫的介紹。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_11_14_%E4%B8%8B%E5%8D%887_31.png?alt=media&token=ffa2704b-b955-49d4-9ed4-69801ec96253)

除了軟體開發以外，目前也越來越多的服務加入了 Markdown 的編寫支援，與文字傳達有關聯性的都慢慢加入其中的語法，像是筆記工具、文字通訊、部落格等等都有這類影子，如 [Bear note](https://bear.app/) 就是完全使用 Markdown 的筆記工具、Slack 則是支援部分的文字訊息、Hexo 則是透過 Markdown 撰寫的部落格工具；除此之外，現在 Facebook 發文也可以使用此格式來撰寫文章（目前是限定社團才能使用）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2FCC12304F-C0D9-4A0F-8DA5-CE1A9846DE5F.png?alt=media&token=6b3146db-b215-44e2-a885-a5181929ce2b)

現在台灣主流的通訊工具 LINE，也可以透過部分的 Markdown 語法來傳遞程式碼或是調整文字格式（電腦版限定）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_11_23_%E4%B8%8A%E5%8D%8811_13.png?alt=media&token=a3c94694-151e-4fad-8845-4f626a5b78c9)

## 學習 Markdown
基本概念：Markdown 可以輸出成 HTML 的格式，所以各種標示也會對應 HTML 的標籤，就顯示的結構上可區分為兩大類：區塊、行內。

- 區塊：此類別會讓內容獨立形成一個區塊，區塊內的 **全部文字都是套用同樣的格式**，標題、引用、清單都是屬於此類型，而區塊可以疊加使用，如引用內可以包含標題。
- 行內：套用此類別的內容可插入於區塊內，如：強調文字、斜體字、文字連結等等，要特別注意插入圖片也是屬於此類別（與 HTML 特性相符合）。

以 Word 的概念來介紹，**區塊元素表示文字整段都是同樣的風格、層級（洋紅色標示），而行內元素則是在區塊的文字上做修飾（綠色標示）**。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_11_19_%E4%B8%8B%E5%8D%8811_13.png?alt=media&token=893c6e7a-010b-452e-913f-5418e91179e8)

除了以上兩點以外，每個 Markdown 環境所能接受的語法都略有不同，像是部分工具、環境雖然接受使用 Markdown 撰寫，但標題上只接受三個以下的層級（正確為六個層級），所以實際上還是需以運行的環境為主，而本篇介紹的則是介紹通用的使用方式。

### 區塊元素

此類別會讓內容獨立形成一個區塊，區塊內的 **全部文字都是套用同樣的格式**，標題、引用、清單都是屬於此類型，而區塊可以疊加使用，如引用內可以包含標題。

#### 標題

總共分為六個層級，依據 HTML 的結構會轉為 `<h1> ~ <h6>`，形式上是在文字前方補上不同數量的 `#`，`#` 數量越少層級越高，反之則是越低，以下方結構來說 `# 標題 1` 是層級最高，且視覺上最大的標題。

```markdown
# 標題 1
## 標題 2
...
###### 標題 6
```

> 呈現結果（以下為 Bear note 的範例）

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F2E67180F-CD56-4FB0-9C7F-5DEC0F3C261E.png?alt=media&token=24c18b5a-ac14-4c41-9da1-bbbb86483014)

---
#### 文字段落
當沒有加上任何標示符號時，該區塊的文字就是**文字段落區塊**，而段落與段落之間會保留一行空白空間，在接下一段的內容。

```markdown
## 這是標題
這是一段文字段落

這是第二行的文字段落，還是要勉強自己，笑起來處子般通紅；看人突然好想你，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。
```

> 實際運作範例：標題、內文

{% raw %}
<div class="demo">
  <h2 ><a href="#這是標題" class="headerlink" title="這是標題"></a>這是標題</h2>
  <p>這是一段文字段落</p>
  <p>這是第二行的文字段落，還是要勉強自己，笑起來處子般通紅；看人突然好想你，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。</p>
</div>
{% endraw %}

#### 引用

引用的寫法與樣式都類似於 Email 中的回文原文，只要在文章前面補上 `>` 的符號即可。

```markdown
> 這裡是一段引用文字
```

> 實際運作範例：引用文字

{% raw %}
<div class="demo">
<blockquote>
<p>這裡是一段引用文字</p>
</blockquote>
</div>
{% endraw %}

部分文件提到：引用文字不僅可以單獨使用，也可以混用其他的區塊元素，或者透過多個 `>` 來調整層級。但要特別注意，並非所有的 Markdown 環境都支援多個層級的寫法，許多環境僅能單獨使用 `>`，

#### 清單

清單分為一般列表及包含數字符號的列表，兩種都包含多個層級，只要加上一個縮排或兩個空格就可以新增一個層級。

一般列表的使用彈性較高，`-`、`+`、`*` 等符號後方加上一個空白後都可以轉為列表，要表示下一個層級可多一個縮排或是兩個空白即可。

```markdown
- 這是清單
+ 這也是清單
* 這同樣是清單
	- 清單子項目
```

> 實際運作範例：一般列表

{% raw %}
<div class="demo">
<ul>
<li>這是清單</li>
<li>這也是清單</li>
<li>這同樣是清單<ul>
<li>清單子項目</li>
</ul>
</li>
</ul>
</div>
{% endraw %}

包含數字符號的列表則是使用 數字 + `.`作為開頭，列表中的第一個數字是數字列表的起始序號，而後方的數字不需要按照順序，如：`1. 2. 2.` 結果依然會是 `1. 2. 3.`；另外縮排的規則與一般列表相同。

```markdown
1. 數字型清單
2. 第二個數字清單
2. 數字清單不需要連續數字
	3. 數字清單子項目
```

後方的數字不需要按照順序。

```markdown
2. 數字清單從 2 開始
3. 第 3
```

> 實際運作範例：數字列表（數字 3 開始）

{% raw %}
<div class="demo">
<ol start="3">
<li>數字型清單</li>
<li>第二個數字清單</li>
<li>數字清單不需要連續數字<ol start="1">
<li>數字清單子項目</li>
</ol>
</li>
</ol>
</div>
{% endraw %}

如果段落文字需要以數字 + `.` 作為開頭，可以改為 數字 + 反斜線 + .，範例如下。

```markdown
2019\. 避免 `數字.` 轉為數字型清單的方法
```

#### 區塊程式碼

作為許多開發者撰寫文本的工具，插入程式碼片段也是合情合理的。Markdown 中會使用三個連續的反引號（**`**）開頭及結尾做為區塊的程式碼，並且可以在首行的位置補上該段程式碼的語言類別，藉此輸出具有 Highlight 的程式碼。

三個連續的反引號（**`**）用在開頭結尾，即可作為區塊程式碼。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201911%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_11_23_%E4%B8%8A%E5%8D%8810_34.png?alt=media&token=41f54821-b727-48e7-9885-cd5dd689f851)

首行補上特定程式碼語言名稱，該段可使用特定語言的 Highlight （依據輸出的環境而定），以下圖為例則是使用 `js` 或 `javascript`。

```js
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log('這執行第' + i + '次');
  }, 0);
}
```

當輸出為 html 時，該段落並不會被瀏覽器作為標籤渲染，而是呈現可被使用者閱讀的程式碼。

```html
<body>
  <p>這是一段 HTML 結構</p>
</body>
```


#### 分隔線

分隔線，可以使用三個連續符號表示（`-`、`*`，部分環境亦可使用 `_`）

```
---
***
___
```

> 實際運作範例：分隔線

{% raw %}
<div class="demo">
  <hr>
</div>
{% endraw %}

#### 表格

雖然 Markdown 有提供表格的符號，但實際運用上並不是很方便，如果環境許可我大多會直接使用 HTML 的表格標籤替代 Markdown 的表格。Markdown 的表個就像是使用符號 “畫” 一個表格，實際撰寫時對其很麻煩。

下圖為表格的範例。

```
| thead 1 | thrad 2 | thread 3 |
|---------|---------|----------|
| td      | td      | td       |
```

> 實際運作範例：表格

{% raw %}
<div class="demo">
  <table>
  <thead>
  <tr>
  <th>thead 1</th>
  <th>thrad 2</th>
  <th>thread 3</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>td</td>
  <td>td</td>
  <td>td</td>
  </tr>
  </tbody>
  </table>
</div>
{% endraw %}


### 行內元素

套用此類別的內容可插入於區塊內，如：強調文字、斜體字、文字連結等等，要特別注意插入圖片也是屬於此類別（與 HTML 特性相符合）。


#### 斜體

斜體字與強調文字使用上是很接近的，可以使用 `*` 或 `_` 符號套用在文字的前後方，即可將文字改為斜體字；而將 `*` 或 `_` 使用連續兩個加在文字的前後方則會是強調文字。

以下為斜體文字的範例，另外在 `*` 或 `_` 的前後補上空白會維持原本的符號，就不會套用斜體效果。

```
還是要*勉強自己*，笑起來處子般通紅；看人_突然好想你_，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。* 普通文字 *。
```

> 實際運作範例：斜體

{% raw %}
<div class="demo">
  <p>還是要<em>勉強自己</em>，笑起來處子般通紅；看人<em>突然好想你</em>，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。<em> 普通文字 </em>。</p>
</div>
{% endraw %}


#### 強調

以下為強調文字的範例，使用兩個 `*` 或 `_`套用在文字的前後方 。`**` 或 `__` 的前後補上空白會維持原本的符號，一樣不會套用強調效果。

```
還是要**勉強自己**，笑起來處子般通紅；看人__突然好想你__，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。** 普通文字 **。
```

> 實際運作範例：強調

{% raw %}
<div class="demo">
  <p>還是要<strong>勉強自己</strong>，笑起來處子般通紅；看人<strong>突然好想你</strong>，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣。<strong> 普通文字 </strong>。</p>
</div>
{% endraw %}


#### 行內程式碼

與區塊程式碼一樣使用反引號，在此改為單一個反引號加在文字的前後方即可。

```
還是要勉強自己，笑起來處子般通紅；看人 `<strong>` 突然好想你 `</strong>`，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣 `var a = 0`。
```
> 實際運作範例：行內程式碼

{% raw %}
<div class="demo">
  <p>還是要勉強自己，笑起來處子般通紅；看人 <code>&lt;strong&gt;</code> 突然好想你 <code>&lt;/strong&gt;</code>，顯露所有鋒芒堅持方向，顯露所有鋒芒堅持方向，在我活的地方為什麼你，我嘆了嘆氣 <code>var a = 0</code>。</p>
</div>
{% endraw %}

#### 連結

連結的結構略有不同，會分為前後兩個片段符號：

- 前者為 `[ ]`：中括號內需要補上連結的**顯示文字**。
- 後者為 `( )`：小括號內補上的是連結路徑。 

> 以下為連結範例：[Google](https://www.google.com.tw/)

```
[Google](https://www.google.com.tw/)
```

#### 圖片

圖片要特別注意是屬於行內元素，因此圖片也可以放在文字段落之中（與 HTML 中的 img 標籤邏輯一致），不過大多情況下會將圖片作為獨立區塊使用。

圖片也與連結結構接近，只不過前方多了 `!`。

- `![ ]`：與連結結構接近，但前方緊貼著 `!` 符號。中括號的內容也並非必填，其文字內容通常作為 hover 後的提示文字或作為 SEO 增強使用。
- `( )`：圖片連結位置。

```markdown
![unsplash 圖片](https://images.unsplash.com/photo-1573900941478-7cc800f708f3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2100&q=80)
```

> 實際運作範例：圖片

{% raw %}
<div class="demo">
  <img src="https://images.unsplash.com/photo-1573900941478-7cc800f708f3?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=2100&amp;q=80" alt="unsplash 圖片">
</div>
{% endraw %}


參考文章：
- [https://markdown.tw](https://markdown.tw/) 
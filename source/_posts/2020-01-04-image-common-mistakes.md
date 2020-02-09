---
layout: post
title: 前端開發者，圖片常犯的五個粗心錯誤
category: development
tagline:
tags: [html]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202001%2Fimg-mistake.png?alt=media&token=860cf55e-b433-44a0-925b-07849ad65d5f
published: true
---

前端開發者是透過程式碼將資訊呈現成畫面，因此畫面的好壞也多少影響品質，在觀看許多履歷或作業的過程中，會發現許多相似的錯誤，而這些錯誤都是有跡可循，並且可以避免的；本篇先以常見的圖片問題與大家分享，看是否你也犯了這些錯誤呢？

## 一、圖片變形

新手錯誤率：⭐⭐⭐⭐
令人感受的粗心度：👎👎👎👎

圖片變形是最明顯的錯誤，大部分的使用者都能看到這樣的問題，而這些問題會讓人感受到開發者的不細心。

要避免圖片變形，關鍵在於「避免在 **比例可能會調整** 的空間使用 `img` 標籤」

以下圖為例：該圖的原始檔案長寬為 `1350px * 901px` 就比例來說是張橫式的圖片，如果在網頁上的空間提供非此比例則會造成變形。

![範例圖片：長寬為 1350px * 901px](https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80)

以下圖來說，左方是屬於正確呈現的圖片，維持原本的橫向矩形，如果改為右圖接近方形的情況就會產生變形。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202001%2F862EFA76-A178-41B6-8188-BE7CD02DF361.png?alt=media&token=a0706597-3f39-485f-b7ab-e81c9690c9aa)

有些時候，比例變化沒有那麼大的情況下，開發者可能會誤以為圖片沒有變形，但在用戶看來並非如此，現在人普遍美感大幅提升的情況下，越來越多人可以輕易看出這樣的問題。

避免方法：
1. 僅限制寬 *或* 高，另一邊使其自由伸展
2. 如果寬高比例是無法控制的，可以使用背景圖作替代

錯誤範例及解決辦法：

{% raw %}
<p class="codepen" data-height="300" data-theme-id="default" data-default-tab="html,result" data-user="Wcc723" data-slug-hash="zYxPmXR" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="圖片變形範例">
  <span>See the Pen <a href="https://codepen.io/Wcc723/pen/zYxPmXR">
  圖片變形範例</a> by Wcc723 (<a href="https://codepen.io/Wcc723">@Wcc723</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
{% endraw %}

範例連結：[https://codepen.io/Wcc723/pen/zYxPmXR](https://codepen.io/Wcc723/pen/zYxPmXR)

## 二、圖片尺寸過大

新手錯誤率：⭐⭐⭐⭐⭐
令人感受的粗心度：👎👎

雖然越高的解析度會有更好的畫質呈現，但受限於裝置能夠呈現的極限及人眼的辨識度下，過於提高的解析度並不會有更高的畫質，反而會造成 1. 圖片下載速度過慢、2. 瀏覽器渲染速度變慢導致網頁操作不順暢。雖然現在的裝置普遍效能很高，但超過 2000px ~ 3000px 的圖片還是會影響顯示效能。

這個錯誤算是最常見，但卻不一定會被發現的錯誤，因為圖片顯示上是沒有問題的（只是可能慢一些），大多情況則是會透過開發者工具檢查此問題。以下圖來說就載入該空間所需十倍尺寸大的圖片

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202001%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_1_4_%E4%B8%8B%E5%8D%882_36.png?alt=media&token=7177b375-5d19-48b4-9856-3da331159295)

{% raw %}
<p class="codepen" data-height="265" data-theme-id="default" data-default-tab="html,result" data-user="Wcc723" data-slug-hash="NWPwOQr" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="圖片檔案過大">
  <span>See the Pen <a href="https://codepen.io/Wcc723/pen/NWPwOQr">
  圖片檔案過大</a> by Wcc723 (<a href="https://codepen.io/Wcc723">@Wcc723</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
{% endraw %}

範例連結：[https://codepen.io/Wcc723/pen/NWPwOQr](https://codepen.io/Wcc723/pen/NWPwOQr)

避免辦法：
1. 簡單解決辦法，釐清你的圖片的用途：
	1. 主要圖片、小圖：**圖片的寬高尺寸盡量不超過顯示區域的兩倍**（ex: 寬度 300px 的顯示區域則圖片寬度不超過 600px 為主），現在許多裝置都有 Retina 顯示器，此情況下 2 倍解析度已有不錯的品質。
	2. 背景圖：因為背景圖並非主要用來傳達資訊的內容，因此使用 1:1 的顯示尺寸即可。
2. 使用 srcset 設置響應式圖像： 透過 `srcset` 可以在同一個 img 標籤載入不同尺寸的圖片，參考[文件](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img#attr-srcset)

範例程式碼：
```html
<img class="img-fluid" srcset="https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80 800w, https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1200&q=80 1200w">
```

請另開分頁，並調整視窗尺寸後並重新整理畫面（可以取得不同尺寸的圖片）：https://codepen.io/Wcc723/full/oNgoQXm

## 三、SVG 內混用了點陣圖、未外框的文字
新手錯誤率：⭐⭐
令人感受的粗心度：👎👎


SVG 是屬於向量圖，而一般的 `jpg`, `png` 是屬於點陣圖，向量圖來說最大的特性在於**沒有解析度的限制**，並且是屬於數學座標，且檔案大多小於點陣圖，並且有極佳的顯示品質。因此再大的區塊，也都僅需要載入很小檔案的 svg 就有很棒的呈現。

SVG 是屬於 XML 格式的標記語言，原始碼的內容都是在標記所有節點的座標位置，因此在原始碼會看到元素標籤、座標位置的相關資訊，輸出的檔案結構如下：
```xml
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="svg-outline" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M49.564,64.336 C45.878,64.336 41.926,62.968 39,60.27 L42.838,55.596 C44.852,57.306 47.474,58.484 49.716,58.484 C52.224,58.484 53.402,57.534 53.402,56.014 C53.402,54.38 51.844,53.848 49.412,52.822 L45.802,51.302 C42.838,50.124 40.064,47.654 40.064,43.55 C40.064,38.8 44.32,35 50.324,35 C53.592,35 57.05,36.254 59.52,38.724 L56.138,42.98 C54.276,41.574 52.528,40.814 50.324,40.814 C48.234,40.814 46.942,41.65 46.942,43.17 C46.942,44.728 48.728,45.336 51.236,46.324 L54.77,47.73 C58.266,49.136 60.356,51.492 60.356,55.482 C60.356,60.194 56.404,64.336 49.564,64.336 Z" id="S" fill="#000000" fill-rule="nonzero"></path>
    </g>
</svg>
```

SVG 圖片範例

{% raw %}
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="svg-outline" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <path d="M49.564,64.336 C45.878,64.336 41.926,62.968 39,60.27 L42.838,55.596 C44.852,57.306 47.474,58.484 49.716,58.484 C52.224,58.484 53.402,57.534 53.402,56.014 C53.402,54.38 51.844,53.848 49.412,52.822 L45.802,51.302 C42.838,50.124 40.064,47.654 40.064,43.55 C40.064,38.8 44.32,35 50.324,35 C53.592,35 57.05,36.254 59.52,38.724 L56.138,42.98 C54.276,41.574 52.528,40.814 50.324,40.814 C48.234,40.814 46.942,41.65 46.942,43.17 C46.942,44.728 48.728,45.336 51.236,46.324 L54.77,47.73 C58.266,49.136 60.356,51.492 60.356,55.482 C60.356,60.194 56.404,64.336 49.564,64.336 Z" id="S" fill="#000000" fill-rule="nonzero"></path>
  </g>
</svg>
{% endraw %}

當 SVG 內容插入點陣圖片後，圖片就不是只存在著座標位置，還會將點陣圖片以 base64 的格式插入。記得，這個圖片會造成許多額外的檔案大小，並且無法如同 SVG 一樣自由縮放，如同喪失使用 SVG 的用意。

通常會出現這樣的錯誤是在設計稿插入了點陣圖，並誤將此圖片輸出出來，開發者如果沒有檢查通常不會主動發現這樣的錯誤。
```xml
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="svg-bmp" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <image id="Bitmap" x="39" y="35" width="22" height="30" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAYAAAAo5+5WAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFqADAAQAAAABAAAAHgAAAAAsUXibAAACGklEQVRIDaWVzUtWQRSHX0sjXfiBCJGErowgqFaJK10kbkUoaKFILmon2V/Qulq0yFoErowWhatEDcGFbcOVIm0EP7ACsbJU+np+rw7OnTtz517eA887M2d+58x978ycW1UKWxNTt6AHrkEL1MFn2IQP8A4W4BCipuBH8AP+5WAdzT04A0G7yMwq5EnoapaJU3zK2vBodTegyHiX+E4381yFSfUAK1BvJ+6NJP3L/Bbo734JaL/hvwQJm2AU+sva9Y6EulRqZzwGG6A4LdwPKVvCE0rcmlKfOM7S1Ql6eOJK9rYZ+hL/xt+YlOYbnTqWaTd9dhrnE6j2TebxvUHke2Lj09kehto8yWzNTQYmSVa7g+4pXLaDY/1FBFlJ3TnViiGoiSW+gkDv2k0QG38i5jZUQdCuMqOLEEvmm39FXOYm69y+BB01X4Is3xQxUVOleg55y6dZ0HsDfas14ByFvOVUt7iQaXP6YAHM04Xa5kKZLfEd+n8yFrhuacvdNn4T9dQVWOP39ENPPGBqhfR6lzPwEbogZvsZgq9mTgtMg/0EbxmnPjPHATdoDxy9idUr0he9bKqpZsJt15h7DY/hBcSu/jyasg3y6yarZNx9lPbollWSyI59ZpKadoTOT7BFRfuTxOvDkLJ2POOg3S6SVBXxLkTtPIoHMAu/wLfIIX7V4/vgPfeZNZQgfYUvwDnQNf0OOqOqwXsQtP8amWC6AXj6RwAAAABJRU5ErkJggg=="></image>
    </g>
</svg>
```

SVG 圖片範例，此範例文字在高解析的裝置下會變得模糊。

{% raw %}
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="svg-bmp" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <image id="Bitmap" x="39" y="35" width="22" height="30" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAYAAAAo5+5WAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFqADAAQAAAABAAAAHgAAAAAsUXibAAACGklEQVRIDaWVzUtWQRSHX0sjXfiBCJGErowgqFaJK10kbkUoaKFILmon2V/Qulq0yFoErowWhatEDcGFbcOVIm0EP7ACsbJU+np+rw7OnTtz517eA887M2d+58x978ycW1UKWxNTt6AHrkEL1MFn2IQP8A4W4BCipuBH8AP+5WAdzT04A0G7yMwq5EnoapaJU3zK2vBodTegyHiX+E4381yFSfUAK1BvJ+6NJP3L/Bbo734JaL/hvwQJm2AU+sva9Y6EulRqZzwGG6A4LdwPKVvCE0rcmlKfOM7S1Ql6eOJK9rYZ+hL/xt+YlOYbnTqWaTd9dhrnE6j2TebxvUHke2Lj09kehto8yWzNTQYmSVa7g+4pXLaDY/1FBFlJ3TnViiGoiSW+gkDv2k0QG38i5jZUQdCuMqOLEEvmm39FXOYm69y+BB01X4Is3xQxUVOleg55y6dZ0HsDfas14ByFvOVUt7iQaXP6YAHM04Xa5kKZLfEd+n8yFrhuacvdNn4T9dQVWOP39ENPPGBqhfR6lzPwEbogZvsZgq9mTgtMg/0EbxmnPjPHATdoDxy9idUr0he9bKqpZsJt15h7DY/hBcSu/jyasg3y6yarZNx9lPbollWSyI59ZpKadoTOT7BFRfuTxOvDkLJ2POOg3S6SVBXxLkTtPIoHMAu/wLfIIX7V4/vgPfeZNZQgfYUvwDnQNf0OOqOqwXsQtP8amWC6AXj6RwAAAABJRU5ErkJggg=="></image>
  </g>
</svg>
{% endraw %}

在 SVG 加入文字內容時，需要確保文字輸出是有被轉外框，如果沒有轉外框程式碼會看似如下簡短，但如果用戶沒有此字體，該文字就無法如預期顯示。

此錯誤是屬於**設計稿中的文字沒有轉外框**，因此開發者很難以發現。
```xml
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="svg-font" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" font-family="NotoSansCJKtc-Black, Noto Sans CJK TC" font-size="38" font-weight="700">
        <text id="S" fill="#000000">
            <tspan x="38.359" y="66">S</tspan>
        </text>
    </g>
</svg>
```

SVG 圖片範例，此範例的文字可以圈選，且與上方的字體不一定相同（視系統內是否有該字體）。

{% raw %}
<svg width="100px" height="100px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="svg-font" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" font-family="NotoSansCJKtc-Black, Noto Sans CJK TC" font-size="38" font-weight="700">
        <text id="S" fill="#000000">
            <tspan x="38.359" y="66">S</tspan>
        </text>
    </g>
</svg>
{% endraw %}

SVG 的錯誤與設計師有很大的關係，因此前端開發者在使用 SVG 稿件時也有義務一同檢視該檔案是否正確。而設計師也需要對此更加注意，避免輸出錯誤的圖檔給予開發者使用。

相較於其它錯誤來說，此錯誤與設計師的稿件輸出有很大關係。因此，如果你是 UI 設計師，此類型錯誤會令人感受到不專業。



## 四、背景圖裁切掉主體

新手錯誤率：⭐⭐⭐
令人感受的粗心度：👎

現在開發都會考量 RWD 的顯示，RWD 中的圖片大多會改變寬高或轉為背景圖來處理，而背景圖並非都適合運用在 RWD 中，因為在縮放的過程中會有不同比例的裁切，這些裁切如果是在主體上，對於網頁品質會有很大的扣分。

在以下的範例中有一個長形的沙發，也由於沙發長度過長，因此在行動版中左右方會有裁切。

{% raw %}
<p class="codepen" data-height="400" data-theme-id="default" data-default-tab="css,result" data-user="Wcc723" data-slug-hash="mdyqzgZ" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="圖片裁切掉主體">
  <span>See the Pen <a href="https://codepen.io/Wcc723/pen/mdyqzgZ">
  圖片裁切掉主體</a> by Wcc723 (<a href="https://codepen.io/Wcc723">@Wcc723</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

因此在選擇圖片時，可以先思考行動版、桌面版所呈現的**比例**，兩者比例中的重疊空間稱為「重疊安全區域」，如果主體可以完整置入此區域內就可以避免被裁切。

![通常來說，方形且在中央區域的主體比較穩定](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%20%EF%BC%91%EF%BC%90.png?alt=media&token=7480df17-3e1b-4c71-8e66-f139525102cc)

完整的介紹文章：[網頁設計 - 響應式圖片選用技巧](/design/2018/11/01/responsive-images/)

## 五、圖片連結錯誤

新手錯誤率：⭐⭐
令人感受的粗心度：👎👎👎👎👎

{% raw %}
<img src="/xxx/xx" alt="這張圖片無法顯示">
{% endraw %}

如果圖片是屬於裝飾類型，並且由開發者所置入，就必須要多加注意。開發者也通常會反覆檢視自己輸出的頁面是很正常的，因此這類型錯誤通常不會是在開發階段時遺漏，很多是在轉換環境時沒有完整檢查出錯。大多原因在於相對路徑與絕對路徑的掌握度不足。


<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
---
layout: post
title: 完全解析 JavaScript import、export
category: development
tagline:
tags: [javascript, modules, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2Fimg-import-export.png?alt=media&token=b0833260-7033-4045-bd6d-4e74df3f6ad5
published: true
---

`import`、`export` 是 JavaScript 模組管理的方法，可以將每個檔案視為一個獨立的模組匯出，並在另一個檔案匯入使用。透過此方式每個檔案更能專注在特定的功能上，且能避免單一檔案過度龐大。

### 相容性
介紹此方法前，還是要了解一下相容性，目前來說許多主流瀏覽器都是可以運行的，但是寫法需要稍做調整，而 Node.js 則是要到 13.2 才可直接運行模組化。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2F5B469D68-AD4B-49D2-866B-C1E911087024.png?alt=media&token=1d606513-ef7a-4cc3-b4b2-9da142f9027b)

### 瀏覽器中運行

如果要在瀏覽器運行模組化，可以在 `<script>` 標籤加上 `type="module"`，接下來無論是使用行內或是外部的 JS 都能運用模組功能。
```html
<script type="module"></script>
```

當然，這樣的模組功能並非所有瀏覽器都能夠運行，如果要同時兼顧新舊瀏覽器，可以改用以下做法：
```html
<!-- 支援 module 語法的新瀏覽器 -->
<script type="module" src="module.js"></script>

<!-- 不支援 module 語法此段會被新型瀏覽器忽略 -->
<script nomodule src="IENotGood.js"></script>
```

## Export 匯出

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2Fimg-export.png?alt=media&token=4bd42d22-43d4-44aa-8801-a4149853a495)

`export` 可以將函式、物件甚至是純值匯出，大部分運用上都是匯出物件（函式）為主，畢竟純值作為模組意義並不大。

export 又可區分為兩種，這兩種的匯出手法略有不同，也會影響到 import 的運用，所以在運用前請先明確區分這兩種的差異（非常重要）：
- named export（具名匯出）：可匯獨立的物件、變數、函式等等，**匯出前必須給予特定名稱**，而匯入時也必須使用相同的名稱。另外，一個檔案中可以有**多個** `named export`。
- default export（預設匯出）：一個檔案僅能有**唯一**的 `default export`，而此類型不需要給予名稱。

除此之外，兩者也可共存於同一個檔案內，只不過 `default export` 僅能有一個。

#### default export（預設匯出）
`default export` 匯出時不需要預先賦予名稱，可以在 `import` 時另外賦予，但要特別注意 `export default` 每個檔案僅能有一個。

直接匯出純值或表達式結果。
```js
export default 1;
```

預先定義一個變數並匯出，這種方式結果與上述的純值一樣。
```js
const a = 1
export default a;
```

export default 匯出物件是最常見的使用方式，此方法通常也會搭配物件的縮寫形式（Object shorthand）。
```js
const obj = { name: 'obj' };
const obj2 = { name: 'obj2' };
export default { obj, obj2 };
```

上段介紹的具名匯出所匯出的函式必須使用**函數陳述式**，而 `export default` 則可以直接使用匿名函式的形式匯出，就不需要預先定義。
```js
// 匯出匿名函式
export default function() {
  console.log('這是一段函式');
}

// 匯出 class
export default class {
  constructor(name) {
    this.name = name;
  }
  callName() {
    console.log(this.name);
  }
}
```

#### named export（具名匯出）
`named export` 是將物件、函式等等預先賦予在特定的名稱上才能匯出，並且在 `import` 時也必須使用**相同的名稱**才能取到相同的變數或物件。

方法 1：具名匯出是需要將變數、物件預先宣告後再進行匯出，因此可以在 `export` 後緊接 `let`、`const` 宣告後再進行匯出。
```js
// let, const 純值
export let a = 1;
export let obj = { name: 'obj'};
```

方法 2（使用率高）：使用函式陳述式匯出，這種方式與上述概念是相近的，一樣是先宣告再匯出。
```js
// 具名方法
export function fn() {
  console.log('這是一段函式')
}
```

方法 3（使用率高）：使用物件縮寫的形式（Object shorthand）匯出物件，算是較為普遍運用的方式，可預先定義好所有的物件、方法後，在文件的結尾統一匯出。
```js
const b = 2;
const obj2 = { name: 'obj2' };
const obj3 = { name: 'obj3' };

export { b, obj2, obj3 };
```

小技巧：再匯出前可另外使用 `as` 修改名稱。
```js
const obj2 = { name: 'obj2' };
export { obj2 as objNewName };
```

#### 並存

具名、預設匯出兩種方法可以並存在同一個檔案內，預設匯出僅能有一個。
```js
export const obj = { name: 'obj' };
export default function() {
  console.log('這是一段函式');
}
```

## Import 匯入

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2Fimg-import.png?alt=media&token=19b37a20-45d3-4100-8b17-a9b8cd219b8d)

匯入的方式會與因為匯出方法不同而改變，因此必須清楚外部資源的匯出方式，如果是第三方資源則可以透過文件了解該如何匯入。

#### 匯入 default export 並賦予名稱

預設匯出每個檔案僅會有一個，並且不會給予名稱，這種匯入方式會將預設匯出的模組引入，並且重新賦予一個變數名稱。
```js
// export file
export default function() {
  console.log('這是一段函式');
}

// import file
import fn from './defaultModule.js';
fn(); // 直接執行函式
```

#### 匯入 named export

具名的匯出方式，則需要使用**解構的語法**將特定的模組取出（命名需與匯出的名稱一致），並且只有被匯入的原始碼片段才能夠被執行。
```js
// export file
export const obj = { name: 'obj'}; // 此段如果沒有被匯入，則無法運作
export function fn() {
  console.log('這是一段函式')
}

// import file
import { fn } from './module.js';
fn();
```

也可以透過解構同時匯入多個物件、變數、函式等等。
```js
// import file
import { fn, obj } from './module.js';
fn();
console.log(obj)
```

#### 重新命名

具名匯出的物件、變數本身就帶有固定的名稱，如果要避免與當前的作用域產生衝突，則可以使用 `as`(alias) 來重新命名匯入的名稱。

可以在解構時針對單一的物件、變數重新賦予名稱：
```js
// export file
export const obj = { name: 'obj'};
export function fn() {
  console.log('這是一段函式')
}

// import file
import { fn as newFn } from './module.js';
newFn();
```

具名匯入亦可使用 `*` 來全部匯入，這時候就必須搭配 `as` 指向一個新的物件變數，此物件的屬性則會帶上所匯入的內容。 
```js
// import file 全部匯入並賦予至一個物件上
import * as name from './module.js';
name.fn();
console.log(name.obj);
```

#### 同時匯入預設、具名

匯出時可同時存在兩種形式，因此匯入時也同樣支援。以下片段來說，在匯入時前者是帶入 `default export`，逗點後方則是帶入 `named export`：
```js
import defaultExport, * as name from "module-name";
```

以下程式碼分別執行了：
1. 匯入 `default export` 並賦予 `fn` 的名稱
2. 匯入全部的 `named export`，並給賦予至 `named` 的物件上
```js
// export file
export const obj = { name: 'obj' };
export default function() {
  console.log('這是一段函式');
}

// import file
import fn, * as named from './defaultModule.js';
fn();
console.log(named.obj);
```

#### 匯入 Side Effect 模組

有些模組並沒有實作 `export`，例如可直接執行的函式檔案，載入後會直接執行，不需要例外的呼叫即可作為  **Side Effect 模組**。

常見案例如早期版本的框架，直接將方法綁定於 window，因此不需要另外呼叫即可運作，如：`jQuery`、`angularJs` 就屬於此類型。

範例如下：模組檔案不需要進行匯出，直接 `import` 後就能運行。
```js
// module file
(function() {
  console.log('IIFE');
})();

// import file
import './fn.js';
```


## 要用 `default` 或 `named`
`default` 是非常易於使用的，針對只有單一元件、模組的檔案匯出上相對直覺很多，我自己開發上也多是利用 `default export`。

但在針對此議題來說，也有查閱過部分的文件，許多都是提到 export default 有管理上的問題，如：
- 具名匯入時，命名須完全一致才可匯入，增加開發的嚴謹性
- 預設匯入時，無法確認該模組內是否有特定變數

因此在開發大型專案、開源套件、眾多模組時，大多都會推薦使用 `named export` 的形式，不過這並非強制性的要求，大家也可以是自己開發上的需求做選擇。

相關文件：
- [深入理解 TypeScript - export default 被认为是有害的](https://jkchao.github.io/typescript-book-chinese/tips/avoidExportDefault.html#commonjs-%E4%BA%92%E7%94%A8)
- [Why I've stopped exporting defaults from my JavaScript modules](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/)
	- [ (译) 为什么我不再使用 export default 来导出模块](https://juejin.im/post/5c4acd646fb9a049b5072f0e)



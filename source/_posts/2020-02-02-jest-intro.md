---
layout: post
title: 十分鐘上手前端單元測試 - 使用 Jest
category: development
tagline:
tags: [test, jest]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-jest.png?alt=media&token=1809e129-03de-4f61-9a13-f8753ddf1786
published: true
---

隨著應用程式越來越大，人工流程的測試也會耗去許多的時間，許多功能再開發後都必須重新進行點擊特定目標、撰寫複雜表單、送出來檢驗功能的正確性，當功能越來越複雜時，人工測試所花的時間也會越來越常，因此改用測試工具相對會節省去許多時間。尤其到了上線時才發現錯誤，那時候心中真的會吶喊 No、No、No～。
	
前端的測試常見的有兩大類別：
1. Unit Test：中文稱為單元測試，是以一個行為進行測試，可驗證運行是否符合結果。
2. E2E Test：直接模擬使用者在瀏覽器上的行為做測試

![Unit 是小單位的測試，而 E2E 則是完整的應用測試](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_2_2_%E4%B8%8A%E5%8D%889_40.png?alt=media&token=251f2e66-b504-4c1e-904f-d07c0f33ce23)

> 圖片來源：[Unit vs E2E Testing for Vue.js](https://vuejsdevelopers.com/2019/04/01/vue-testing-unit-vs-e2e/)

因此 Unit Test 相對來說測試成本降低非常多，在任何時間點都可以優先導入測試（甚至在開發前 - TDD），雖然測試聽起來要另外撰寫程式碼做驗證，但撰寫並不一定會花上許多時間（思考驗證邏輯反而會花上許多），但好的測試可以帶來許多的優點：
- 避免修改程式碼後的錯誤：修改程式的過程中可能會發生蝴蝶效應，A 處修改的原始碼卻使看似毫無關聯的 B 處錯誤。
- 不需要每次修改都重新人工測試

除此之外，身為一個工程師看不慣前輩（或是過去的自己）的 Code 是很正常的，但重構同時也會帶來風險，如何確保新舊程式碼之間的結果一致是相對困難的過程。

## Jest
本篇會以 Jest 作為起手式介紹，後續也會另外介紹一篇 E2E 的測試框架。Jest 在 React 界有許多開發者推薦使用，Vue 的 Cli 中也是可做為預設的單元測試選項。

單元測試的基本觀念是對 `function` 進行測試，但許多同學可能聽到 "測試" 就會覺得些許的麻煩。接下來我們透過一個小故事來介紹單元測試中的各種行為。

> 小明是一間麥當當分店的店長，接下來要為新進的員工進行評鑑，因此他模擬了顧客行為要在麥當當買大麥克套餐 127 元，並且使用百元鈔票付款，因此他會拿出 200 元現金，預期讓點餐員找回正確的零錢。

因此，這段對應到單元測試會有以下流程：
1. 測試的目標為何？ -> 會使用一段文字描述做什麼、期望的結果為何
	- 小明決定拿出 200 元，心裡想著「拿 200 元買套餐，預期會找 73 元」
2. 導入要測試的函式 -> 實際運行的過程
	- 點餐員收走了 200 元減去大麥克套餐的 127 元，得到了 73 元找給了小明
3. 測試的期望是什麼？ -> 驗證的期望值，可以用各種方式比對結果
	- 小明收了錢後，算了算確實是 73 元沒有錯

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-jest%20img-01.png?alt=media&token=6f5fe263-ca87-4b7f-8129-354f898a9d8d)

在這個過程中就有可能發生：
- 點餐員不夠專業，找錢的過程出錯
- 小明的預期是錯誤的，可能小明在一開始就沒規劃好，也沒算準導致錯誤

無論如何，接下來我們將透過實際的程式碼來介紹上述的過程。

### 驗證點餐員的行為是否符合預期

接下來，我們會新增兩個檔案，一個是點餐員的行為，另一個是測試整個過程的腳本。
```
|- employee.js          點餐員的行為
|- employee.test.js     點餐員的測試腳本
```

點餐員目前只有一個行為就是找零錢，他會接收兩個數值（顧客的現鈔、餐點的價格），並且回傳一個結果（找的零錢）。注意：**這個檔案必需 export 才能被測試檔案接收並測試**。
```js
const employee = {
  makeChange: function(bill, price) {
    return bill - price;
  }
};

module.exports = employee;
```

命名一個中間補上 `.test.` 的檔名作為測試檔（這是測試預設的檔名），接下來在此補上要測試的內容。測試的過程中會明確的標上「測試的目標描述`test(...)`」，並且定義「測試的結果是否符合預期`expect()...`」
```js
const employee = require('./employee');

// 明確描述測試的目標：'拿 200 元買套餐，預期會找 73 元'
test('拿 200 元買套餐，預期會找 73 元', () => {
  const bill = 200;  // 小明手中的鈔票
  const price = 127; // 餐點的價格

  // 期望找錢的結果是符合預期的
  expect(employee.makeChange(bill, price)).toBe(73);
});
```

**準備安裝環境及測試結果**，在上述過程中已經將原始碼及測試的過程都準備好，接下來只要小步驟就能將測試環境導入：

1. 輸入 `npm install jest --save-dev` 安裝 Jest
2. 打開 `package.json` 內將 script 內新增方法並加入 `jest`。

```json
{
  "devDependencies": {
    "jest": "^24.9.0"
  },
  "scripts": {
    "test": "jest" // 運行 test 的方法時，會使用 jest 作為套件開始運行
  },
  // ...
}
```
3. 輸入 `npm run test` 查看結果

如果過程沒有錯誤，你應該可以在終端機下看到以下結果，我們定義了一個目標「拿 200 元買套餐，預期會找 73 元」，這個測試結果是沒有問題的。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F2E447489-6AE1-4689-A4D9-F8DC81289B50.png?alt=media&token=dba98c41-cd79-4324-b76c-0483fc4db5c3)

到此，已經掌握到基礎的測試過程，提出一個目標並且使期望值通過（心中是否會聽到 Yes、Yes、Yes 的聲音呢？）。

![](https://i.ytimg.com/vi/ixoK4PV7x0A/maxresdefault.jpg)

監控測試：也可以將 `scripts` 中的方法改為如下，就可以不需要每次都重新輸入 `npm run test`
```json
{
  "devDependencies": {
    "jest": "^24.9.0"
  },
  "scripts": {
    "testwatch": "jest --watchAll"
 // 使用 npm run testwatch 時會持續用監控的形式，而不是只有單一次報告
  },
  // ...
}
```

藉此，相信你對於測試有基本的概念，在進入下一個階段前可以先回顧一下三個階段：
1. 測試的目標為何？ -> `test('...', ()=>{})`
2. 導入要測試的函式 -> `employee.makeChange()`
3. 測試的期望是什麼？  -> `expect(...).toBe(...);`

#### 專案結構調整

透過範例了解以後，我們稍微調整一下專案結構，便於後續的介紹：

資料夾目錄與上述接近，將 `employee` 改為 `fn`，用來定義多個函式。
```
|- fn.js          原始的測試檔案
|- fn.test.js     測試的腳本
```

JS 檔案中，透過物件定義多個行為。
```js
const fns = {
  // ...
}

module.exports = fns;  // 將函式給予匯出
```

`fn.test.js` 這個測試檔案將匯入上述的函式檔案，並且開始進行測試：
```js
const fn  = require('./fn');

test('...', ()=> {
  ...
});
```

準備好以後，我們來繼續往下介紹吧！

## 搭配 VSCode 環境
除了使用終端機外，Jest 與 VSCode 也能有很好的整合，不需要每次運行都輸入 `npm run test`，搭配套件使用即可在每次存檔後看到測試的結果。

套件連結：https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest

接下來新增一個 `jest.config.js`，此測試檔案預設僅需要匯出一個空的即可運作（全部使用官方預設即可），參考如下：
```js
module.exports = {
};
```

```
|- fn.js          原始的測試檔案
|- fn.test.js     測試的腳本
|- jest.config.js 新增的 Jest 設定檔案
```

在測試的文檔右方即可看到測試成功的 v，如果是失敗狀態則會出現紅色的 x。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F2CB85F9B-3BA8-48CE-B4BD-8CF8A32C9C1B.png?alt=media&token=03914775-ba75-47b9-919c-2445c94a32cc)

錯誤的狀態如下，會出現 x ，並且在 expect 行列上出現紅色下底線，游標在上時會提供預期值及實際接收值。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FF35348BD-B7EC-4441-BCB1-DD8A3E8A07ED.png?alt=media&token=609c5d0c-984b-4a8f-a3a7-8a332fcb51f6)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F1048885A-1DDF-4B73-B3C2-39C4ECE34B36.png?alt=media&token=6bc20e4e-0333-458b-85de-1ffbefd2b3da)

### VSCode 片段提示

每次都要重新輸入 `test('....', ()=> {})` 或各種驗證覺得麻煩嗎？Jest 的各種語法都很好理解，但反覆輸入真的會花上許多時間，因此可以透過 Snippets 來增快寫測試的速度。

https://marketplace.visualstudio.com/items?itemName=andys8.jest-snippets

使用方式，輸入比對方法中的首字及其後的大寫字母（建議直接從 Jest 官方文件去做聯想，可以學得更快），參考如下：
- `tb` -> `expect().toBe();`
- `tblt` -> `expect().toBeLessThan();`
-  `tblte` -> `expect().toBeLessThanOrEqual();`

基本的起手式，也可以輸入 `test` + `tab` 即可出現以下片段：
```js
test('should ', () => {
  
});
```

在測試的檔案下，輸入特定字母也會提示具有哪些片段可用。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F99D96F65-1C61-469E-87C2-150D2F64D4D5.png?alt=media&token=1e907cfd-7ce4-461f-ac65-0f71b3bfe079)

## 常見的條件驗證方式 - matchers
編寫測試時需要讓值符合期望，Jest 中的 expect 後方可以使用 `matchers`（匹配器）作為條件驗證，如先前的範例 `expect(...).toBe(...);` 中的 `toBe` 就屬於 `matchers`，作為各種不同條件的驗證使用。

如果是熟悉 JavaScript 的開發者，可以直接看 Jest [官方文件](https://jestjs.io/docs/en/22.x/expect) expect 的部分，所有的 `matchers` 皆陳列於此，本段落會列出實際開發中常見的 `matchers`，有了基礎概念後，對於官方所提供的文件也能更快上手。

在 `fn.js` 中先定義多個方法，這些方法會回傳數值、`null`、`undefined` 等各種純值，另外還會回傳**物件**（物件的驗證概念會與純值不同）。
```js
// 原始碼
const fns = {
  add: (num1, num2) => num1 + num2,
  isNull: () => null,
  isUndefined: () => undefined,
  isNaN: () => NaN,
  checkValue: (val) => val,
  createUser: () => {
    return {
      name: '小明'
    }
  }
}
```

在純值的驗證上相對單純，除了 `toBe` 外，有各種直白的 `matchers` 可供利用。
```js
// toBe：使值完全符合，判斷是使用 Object.is
// 概念接近於 `===`
test('測試 fn 相加是否正確', () => {
  expect(fn.add(5, 5)).toBe(10);
});

// toBeNull：測試回傳值是否為 null
test('測試 fn 是否為 Null', () => {
  expect(fn.isNull()).toBeNull();
});

// toBeUndefined：測試回傳值是否為 undefined
test('測試 fn 是否為 Undefined', () => {
  expect(fn.isUndefined()).toBeUndefined();
});
```

在 JavaScript 中，如果使用 `NaN === NaN` 則會回傳 False，官方另有提供 `toBeNaN` 作為驗證，但其實使用 `toBe(NaN)`也能通過，主要原因 toBe 是使用 `Object.is` 的方法，相關討論可參考 [NaN check](https://github.com/facebook/jest/issues/4907)：
```js
// toBeNaN：測試回傳值是否為 NaN
test('測試 fn 是否為 是否為 NaN', () => {
  expect(fn.isNaN()).toBeNaN();
});
```

真值、假值（`truthy`、`falsy`）是判斷式中的判斷依據，並不一定完全是布林值的 `true` or `false`，所以在此就不適合使用 `toBe`，可以使用 `toBeFalsy`、`toBeTruthy` 進行驗證。
```js
// 以下是判斷真值與
test('測試 fn 是否為 是否為假值', () => {
  expect(fn.checkValue(0)).toBeFalsy();
});

test('測試 fn 是否為 是否為真值', () => {
  expect(fn.checkValue(1)).toBeTruthy();
});
```

### 物件比對

JavaScript 的特性之一，**物件是傳參考而不是傳值**（關鍵字可查詢：Javascript call by sharing）。

以下列範例來說，雖然物件內的值是相同的，但因為物件是傳參考的特性，所以最終所回傳的結果還是 `false`。
```js
const user = {
  name: '小明'
}

console.log(user === {name: '小明'}); // false
```

在 Jest 也是相同的概念，如果直接使用 `toBe` 來比對物件，就算其內部的屬性值是相同的，一樣會得到 `failed` 的結果。
 
範例：
```js
// 原始碼
const fns = {
  createUser: () => {
    return {
      name: '小明'
    }
  }
}

// test (failed)
test('測試 fn 是否為 小明', () => {
  expect(fn.createUser()).toBe({
    name: '小明'
  });
});
```

因此在做物件比對時，必須使用另一個方法 `toEqual` 才能比對兩個物件內的值是否相同。

```js
// test (passed)
test('測試 fn 是否為 小明', () => {
  expect(fn.createUser()).toEqual({
    name: '小明'
  });
});
```

#### toBe 及 toEqual 的差異

`toBe` 及 `toEqual` 語意上都是很接近的，許多情況下兩者混用也會出現相同的結果，但在運作上會有所不同，以下分別列出兩者特點及差異：

- `toBe` 是使用 `Object.is` 作為判斷，並非使用 `===`，所以在部分情況下會與 ECMAScript 有所不同。
- `toEqual` 是屬於深度比對（*deep equality*），一一使用 `Object.is` 比對物件或陣列內的純值；也由於是深度比對，就如同在物件內將值一一取出重新比對，效能上會較差一些。

參考：
- https://jestjs.io/docs/en/expect#toequalvalue
- https://jestjs.io/docs/en/expect#tobevalue
- Jasmin（此段說明接近 Jest）：https://stackoverflow.com/questions/22413009/jasmine-javascript-testing-tobe-vs-toequal


### 數值比對

數值比對中也有提供「大於、小於、大於等於、小於等於」等方法，以下直接提供範例做參考：

```js
// test
test('測試數值 是否小於 2000', () => {
  const num1 = 1000;
  const num2 = 900;
  expect(num1 + num2).toBeLessThan(2000);
});

test('測試數值 是否小於 2000', () => {
  const num1 = 1000;
  const num2 = 1000;
  expect(num1 + num2).toBeLessThan(2000);
});

test('測試數值 是否小於或等於 2000', () => {
  const num1 = 1000;
  const num2 = 1000;
  expect(num1 + num2).toBeLessThanOrEqual(2000);
});
```


### 字串符合

字串除了 toBe 以外，還可以使用 `toMatch` 搭配正規表達式進行驗證，以下提供 mail 的驗證供參考：  

```js
test('測試 email 格式是否正確', () => {
  expect('gres@gmail.com').toMatch(
    /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
  );
});

test('測試 email 格式是否正確 2', () => {
  expect('gres@gmail').toMatch(
    /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
  );
});
```

### 陣列是否包含特定值

陣列比對上與物件相同，都是使用 `toEqual()`，另外可以使用 `toContain` 檢視陣列中是否有包含特定值。

```js
test('陣列是否包含 Casper', () => {
  const newArray = ['Bob', 'Someone', 'Casper'];
  expect(newArray).toContain('Casper');
});
```

## describe
`describe` 的用途是提供一個群組的描述，以一開始的範例來說，我們可能會驗證點餐員以下行為是正確的：

- 點餐內容與顧客需求相符
- 結帳金額正確
- 找零的金額正確

那麼 describe 就可以將這些測試定義成一個群組：
```js
describe('僱員的行為測試', () => {
  test('點餐內容與顧客需求相符', () => {});
  test('結帳金額正確', () => {});
  test('找零的金額正確', () => {});
});
```

在使用 `npm run test` 則可以接受到群組的測試結果。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F31C2FE55-F215-4D4A-AC34-0286D9AE90EE.png?alt=media&token=b8ed15bc-b6f9-4300-8956-ff979ca74a79)

`describe` 的群組定義也同樣可以使用巢狀，詳細可見官方網站：
https://jestjs.io/docs/en/api#describename-fn

## 預告
單元測試難的也並非是語法，更重要的是如何驗證函式的行為與產品邏輯一致。本篇簡單入門了 Jest 的運作方式，接下來還會繼續介紹非同步的測試及框架的實戰測試方法。

參考：
- 官方文件：https://jestjs.io/en/
- 單元測試和整合測試的涵蓋範圍：https://ithelp.ithome.com.tw/m/articles/10229734
- 影片：https://www.youtube.com/watch?v=7r4xVDI2vho
- 神 Q 超人簡報：https://hackmd.io/@ei_7gAIeSEq2x9U-cH1WoQ/r1FoTHClL
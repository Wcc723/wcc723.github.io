---
layout: post
title: JavaScript 表達式觀念及運用 - JS Expression
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_02.jpg?alt=media&token=a167272b-0a88-4b75-b2a5-73193b8e8b23
published: true
---

JavaScript 分為兩大的語句類型，就像是我們日常語言中的動詞、名詞、連接詞等概念，但在 JS 中僅分為兩大類型，分別為「陳述式」及「表達式」，其中表達式更為重要，如果能夠熟練表達式更能解決許多開發上的問題，也更能活用各種語法。

> JavaScript 中的表達式原文為 「Expression」，翻譯上常見的有表達式、表示式、運算式等等。

## 表達式與陳述式的差異
表達式及陳述式在各文件上都有概略提到，但通常不會讓人覺得是重要的篇章，所以快速略過。不過在 JavaScript 的運用中，如果熟練「表達式」的觀念，將能增加許多運用的技巧且能避免許多不必要的錯誤。

- 陳述式：會執行一些程式碼，可能是幾個單詞或是一個片段（但不會是單一個字母），但最大的特徵是**不會回傳結果**。
- 表達式：最大的特徵在於**會回傳結果**。

### 陳述式 Statement

陳述式有幾大分類，如：
- 宣告（var、function）
- 流程控制（block、if...else）
- 迴圈（for、for...in）
- 其它（import, export）

完整分類可參考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements)

陳述式可能是幾個單詞或是一個片段（但不會是單一個字母），其中也會混合到表達式的詞彙，所以當我們撰寫一段程式碼如下即可稱為陳述式（注意：是 `var a` ，而不是 `var` 也不是 `a`），用此語法即可宣告一個變數。

```js
var a;
```


相同的道理，如果我們僅有使用 `{}` 這個意思是「物件」，這不會是一個陳述式，必須在其中加入一些片段程式碼才會是陳述式，結構如下：

```js
{
  console.log(a);
}
```

陳述式先了解至此即可，我們先來看表達式。

### 表達式 Expression

表達式的特點就是會回傳一個結果，所以任何可**回傳結果**都可稱為表達式（這句話看起來就是一段廢話，但實際運作時卻常常讓人有錯誤的判斷）。常見如下：

- 純值
- 變數
- 運算子
- 執行函式
- 正規表達式
- 函式表達式
- ...

表達式的重點在於「回傳結果」，因此是否能夠**回傳結果**就能判斷該語句或詞是否為表達式，我們用數字 1 來解釋什麼是回傳結果。

```
1
```

直接打開你的 Chrome 的開發者工具，將上面的數字 1 貼到開發者工具內後按下 Enter，你會看到兩個數字 1 分別如下顯示：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_13_%E4%B8%8A%E5%8D%8811_19.png?alt=media&token=5719c68e-6b42-4521-95d1-4daeb7687958)

因此在這之中數字 `1` 就是表達式（是的，單一個純值就是表達式），接下來加入一些運算子增加這段程式的複雜度，使用兩個數字 1 來進行比對。

```js
1 === 1
```

接下來會得到 `true` 的結果，所以 `1 === 1` 是屬於表達式。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_13_%E4%B8%8A%E5%8D%8811_22.png?alt=media&token=b5bd0ec0-44a8-44ce-abed-2e198a290dc6)

相同的概念，如果定義了一個函式並運行它，那麼運行所回傳的結果也會稱為表達式。

```js
// 函式陳述式宣告一個函式
function fn() {
  return 1;
};

// 呼叫函式
fn();
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_13_%E4%B8%8A%E5%8D%8811_29.png?alt=media&token=09aedf99-68ee-4bed-a100-6e6e4f373c1d)


### 容易搞混的地方

“式” 這個字在中文通常表示為一段文字，所以我們常會誤解表達式、陳述式代表的是一個完整片段；而實際運作上陳述式大多是一個片段或詞彙沒錯，但表達式可以獨立出現，也可與陳述式混合使用。

以下片段程式碼整體來說是屬於陳述式（運作上不會回傳結果），但其中會夾雜許多表達式的語句。
```js
if (a) {
  fn(); // 函式呼叫後會回傳結果，因此也屬於表達式
}
```

圖解案例：
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_13_%E4%B8%8A%E5%8D%8811_34.png?alt=media&token=5991b388-86cf-4eff-966d-f5db6940a474)

當然，還有多個表達式混合的概念，如運算子本身就是由多個表達式組成，常見的「二元運算子」，就是由一個**運算子**加上前後的**運算元**所組成，而運算元也是屬於表達式的一種。關於運算子[可參考](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators)。

```
運算元1 運算子 運算元2
```

範例如下：
```js
1 === 1;
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_13_%E4%B8%8A%E5%8D%8811_41.png?alt=media&token=31b4c2c4-6297-4156-867d-dc99889c62ee)

所以在此範例中，也可以將**運算元**替換成 “呼叫函式” 或 “任何的表達式”。
```js
function fn() {
  return 1;
};
fn() === fn();
```


## 哪邊可以看到表達式
相對於死板板的陳述式來說，表達式相當靈活且無所不在，當我們在查找文件中都可看到相對應的蹤影，在此先記得 "expression" 這個單字。

記得：你可以將文件中的 expression 語句替換成任何喜歡的表達式來執行，但絕不能替換成陳述式（statement）。

#### 案例：if 陳述式

文件：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else

文件中說明 if 陳述式中的結構如下：
```
if (condition)
   statement1
[else
   statement2]
```

其中包含了 condition(條件式) 及 statement(陳述式) 這兩個語句，再往下可以看到針對這兩個語句的說明。

> condition: An **expression** that is considered to be either truthy or falsy.
> 判斷式：一個**表達式**，它的值會被判定為真值或假值。

因此 if 後方的條件式可以使用任何的表達式進行替代，因此可以如下的方式替換（替換成呼叫函式、各種運算子都是沒有問題的）。

```js
if (1 + 1) {
  console.log('1 + 1 為真值')
}
```

只要把握此原則就可以進行任何的替換，但絕對不能替換成陳述式，陳述式則會出現語法上的錯誤。
```js
if (var a = 1) {
  // ...
}
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD95BCC87-4451-46DB-B935-19E907924BA4.png?alt=media&token=e448f56d-adbb-4234-9913-e7d223eb8c5e)

## 結語

表達式在 JavaScript 是看似簡單的觀念，但了解以後可以更靈活運用許多語法，除此之外有許多的設計模式及觀念，也都是必須靈活運用表達式才可達成。

本篇附上幾個題目，大家可試著猜看看該片段程式碼屬於 “陳述式” 或 “表達式” 喔

題目 1：
```js
var object;
```

題目 2：
```js
new Object(1);
```

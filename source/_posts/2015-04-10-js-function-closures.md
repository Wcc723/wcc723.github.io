---
layout: post
title: Javascript 閉包
category: javascript
tagline: 
tags: [javascript]
cssdemo: 
jsdemo: 
thumbnail: 
published: true
---

一直以來我都不太敢寫純 Javascript的文章，主要原因是底子不夠深，害怕寫了之後錯誤太多，但最近想學看看React.js，如果說一直不敢寫的話，那麼就無法進步。

這篇是要介紹Javascript閉包，參考的是[這篇文章](http://www.cnblogs.com/leoo2sk/archive/2010/12/19/ecmascript-scope.html#comment_tip)，這篇寫得不錯，從頭到尾看到有感受到閉包的用法，但或許有錯誤，也在這邊重頭到尾表達一次，在詢問大家是否有需要糾正的。

<!-- more -->

## 變數與作用域

### 範例一

首先一開始要先了解最基本的變數，變數可以分為全域及區域變數，以下範例的`name = "阿帕契"`就是全域變數，所以當`alert(name);`時就會直接調用全域的
`"阿帕契"`；在funcA()內的`var name = "澇哥哥"`則是區域變數，所以執行`funcA()`則會運算內部的`"澇哥哥"`。

```javascript
var name = "阿帕契";

function funcA(){
  var name = "澇哥哥";
  alert(name);
}

funcA(); // "澇哥哥"
alert(name); // "阿帕契"
```


### 範例二

這個範例和剛剛很類似只是把函式`funA()`內的`var name = "澇哥哥";`改成`name = "澇哥哥";`，這樣就會有全然不同的結果。

- 首先第一個`alert(name);`會直接調用全域的name，所以結果會是`"阿帕契"`。
- 接下來執行`funcA()`，會得到函式內的`name = "澇哥哥";`，但其實這時候全域的`name`已經被取代成`"澇哥哥"`。
- 最後的`alert(name);`顯示的是被取代的`name`也就是`"澇哥哥"`。

```javascript
var name = "阿帕契";

function funcA(){
  name = "澇哥哥";
  alert(name);
}

alert(name); // "阿帕契"
funcA(); // "澇哥哥"
alert(name); // "澇哥哥"
```

> 所以在函式內部使用var則會定義區域變數，不使用則是全域

## 閉包

和[原作文章](http://www.cnblogs.com/leoo2sk/archive/2010/12/19/ecmascript-scope.html#comment_tip)來比，我會省略掉很多內容，主要是要介紹作用域、閉包。

在阿帕契案中，一開始只因為某藝人在Facebook上上傳了阿帕契的觀光照片，所以爆出了這個案件(`var Apache = funcA();`)，許多人就開始搜尋或者調查阿帕契(`alert(name);`)，不論是機種還是性能等等。後來阿帕契案件越滾越大，發現每天調查多會多一團(`Apache();`, `Apache();`, `Apache();`)。


```javascript
var name = "阿帕契";

function funcA(){
  var name = "澇哥哥一團";
  alert(name);
  return function(){
    name = name + " 再多一團";
    alert(name);
  };
}

var Apache = funcA(); //"澇哥哥一團"
alert(name); //"阿帕契"
Apache(); // "澇哥哥一團 再多一團"
Apache(); // "澇哥哥一團 再多一團 再多一團"
Apache(); // "澇哥哥一團 再多一團 再多一團 再多一團"
```

#### var Apache = funcA();

這整個過程中，全域的`name = "阿帕契";`依然都沒有變動，而執行`var Apache = funcA()`時，區域變數的`name`宣告為`"澇哥哥一團"`，這整個函式也就結束，所以第一次執行也就到`"澇哥哥一團"`。

#### Apache();

	var Apache = funcA();

以上這段執行後，`"澇哥哥一團"`也是大家都知道的事情了，其實也就沒必要一直反覆提()，只是檢調每次調查時，都會再多出一團，這段就是`return function()`，他調用存在`Apache();`函式中的`name`，並且在每次執行時再多一團。

> 所以閉包就是能訪問另一個函式的變數(`var Apache = funcA();`)。

#### This

```javascript
var name = "阿帕契";

function funcA(){
  var name = "澇哥哥一團";
  alert(name);
  return function(){
    name = name + " 再多一團";
    alert(this.name);
  };
}

var Apache = funcA(); //"澇哥哥一團"
alert(name); //"阿帕契"
Apache(); //"阿帕契"
```

文中最後還提到了`this`，它提到`this`是調用目前函式的對象，所以在閉包內使用`this`，我們實際是執行以下的函式。

	window.funcA();

所以指向的都是全域的`var name = "阿帕契";`。


## 更棒的文章

在寫完這篇後，我看到一篇更棒的文章[http://blog.taian.su/2012-10-17-explaining-javascript-scope-and-closures-by-robert-nyman/](http://blog.taian.su/2012-10-17-explaining-javascript-scope-and-closures-by-robert-nyman/)，這篇將閉包解釋得更清楚，且還有許多的範例，有機會一定要跟著做一次喔。

如果本文有錯誤，煩請提出，我會盡快理解在修正。
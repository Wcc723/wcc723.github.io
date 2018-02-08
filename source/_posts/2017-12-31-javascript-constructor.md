---
layout: post
title: 鐵人賽：ES6 建構式語法糖
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_27.jpg?alt=media&token=018210e4-496a-4b6a-b549-718c10988541
published: true
---

這一段與先前介紹的建構式概念接近[連結](https://wcc723.github.io/javascript/2017/12/18/javascript-constructor/)，單篇觀看可能無法理解為何 JavaScript 要加入 Class 的概念，而 Class 在 JavaScript 只是個語法糖，讓建構式及原型更容易被表現而已。

## ES6 建構式

這裡我們先將先前章節的程式碼整理過來，除了順序有些調換外，觀念上是沒有差異的，最後產生的值包含了物件屬性及原型的方法。

```js
function PhoneTemplate(brand, modal, withCamera) {
  // 定義基本屬性
  this.brand = brand;
  this.modal = modal;
  this.withCamera = withCamera || false;
}

// 原型方法
PhoneTemplate.prototype.takePhoto = function (someone) {
  if (this.withCamera) {
    console.log(this.modal + ' 照相');
  } else {
    console.log(this.modal + ' 這台沒有照相功he能');
  }
}
PhoneTemplate.prototype.callSomeone = function (someone) {
  console.log('打通電話給 ' + someone)
}

var sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
var nokiaPhone = new PhoneTemplate('Nokia', '3310', false);
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F6B29F092-4FF7-4447-AEE7-CB731985B887.png?alt=media&token=5758a083-e780-4bd5-bcde-52cf482efcff)

接下來使用 `class` 來改寫，你可以對應著上方的原始碼與下方的一起看，僅有三個小地方要稍作修改：
1. `function PhoneTemplate` 定義名稱 -> class PhoneTemplate
2. 初始化物件屬性寫在 `constructor ()`內，一個 class 也只能有一個 `constructor`。
3. 原型方法直接寫在 class 內就可以了

```js
// ES6 Constructor
class PhoneTemplate {
  // 定義基本屬性
  constructor (brand, modal, withCamera) {
    this.brand = brand;
    this.modal = modal;
    this.withCamera = withCamera || false;
  }
  
  // 原型方法
  takePhoto () {
    if (this.withCamera) {
      console.log(this.modal + ' 照相');
    } else {
      console.log(this.modal + ' 這台沒有照相功he能');
    }
  }
  callSomeone (someone) {
    console.log('打通電話給 ' + someone);
  }
};

var sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
var nokiaPhone = new PhoneTemplate('Nokia', '3310', false);
```

結果：
- `constructor` 定義了原本在物件內的屬性及值，其中也包含外部傳入的參數。
- 原型原本是 `prototype` 的方法，在 Class 的類別方法是直接寫在 `constructor` 的後方，這樣的好處讓程式碼閱讀更為容易。

## static 靜態方法

靜態方法屬於原型專屬的方法，它並不會繼承到物件上。像是陣列原型中有一個 `of()` 的方法，但一般陣列是無法使用專屬於原型的陣列方法。

```js
Array.of(1,3,4,5,6); // [1, 3, 4, 5, 6]
[1, 3, 4, 5, 6].of();
[1,3,4,5,6].of is not a function
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c28.jpg?alt=media&token=7625bfc5-04e2-4600-8740-5836e5ec1222)

靜態方法只能被原型使用，無法在創立的物件上使用。

```js
class PhoneTemplate {
  // 定義基本屬性
  constructor(brand, modal, withCamera) {
    this.brand = brand;
    this.modal = modal;
    this.withCamera = withCamera || false;
  }
  // ...

  // 靜態方法
  static info() {
    console.log('這是手機原型');
  }
};

var sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
sonyPhone.info();
// sonyPhone.info is not a function

PhoneTemplate.info();
// 這是手機原型
```

## Setter, Getter

Getter, Setter 顧名思義，一者是傳入、另一則是讀出，兩者可以同時對 "相同的變數" 進行操作，如以下範例來說，我們可以傳入 1，但讀出為 2。set 同時修改傳入的變數，讓 get 的資料不同。

```js
// ES6 Constructor
class PhoneTemplate {
  // 定義基本屬性
  constructor (brand, modal, withCamera) {
    this.brand = brand;
    this.modal = modal;
    this._core = 1
    this.withCamera = withCamera || false;
  }

  // get, set
  get core () {
    return this._core
  }

  set core (coreNum) {
    let num = Number.parseInt(coreNum)
    this._core = num * 2
  }

  // 其它原型方法
  // ...
};

const sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
console.log(sonyPhone.core); // 1，預設的 _core
sonyPhone.core = 4;  // 傳入 4
console.log(sonyPhone.core); // 會透過 set core * 2，結果會是 8
```

另外特別是傳入的方式是使用 `等號`，而不是 function 的參數。

- 如果只有 getter 則不能修改 
- setter 則只能傳入一個參數

### ES6 建構式 + extends

先前已經使用一個建構式建立基本的原型，在先前我們也有提到，原型概念中還有一個是原型鍊。也就是原型可以不斷地繼承，但到目前為止的範例我們都只有創造一層原型。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F9617EE60-DD94-4F43-A027-D77318E4E74F.png?alt=media&token=0bc1f431-45eb-409b-b599-4e500821fe48)

手機模板是一個基本的原型，這個原型不夠使用時我們可以在上新增方法，但有些時候我們擔心會干擾到其它已建立的原型，我們可以使用 `extends` 來擴增新的方法。

有個品牌總是要做出最屌最潮的手機，他可以以目前手機作為基礎再加以擴增。 

這裡會看到兩個新的單字 `extends`、`super`：
- `extends`: 繼承於另一個原型之下
- `super` :  使用上層的值(屬性)
```js
// 第一層
class PhoneTemplate {
  constructor (brand, modal, withCamera) {
    this.brand = brand;
    this.modal = modal;
    this.withCamera = withCamera || false;
  }

  takePhoto () {
    if (this.withCamera) {
      console.log(this.modal + ' 照相');
    } else {
      console.log(this.modal + ' 這台沒有照相功能');
    }
  }
  callSomeone (someone) {
    console.log('打通電話給 ' + someone);
  }
};

// 利用上一個建構式作為延伸
class ApplePhone extends PhoneTemplate {
  constructor (brand, modal) {
    super(brand); // 繼承原本的建構式中的變數
    this.modal = 'iPhone'; // 直接賦予變數
  }

	// 直接寫入新的方法
  hiSiri () {
    console.log('hi Siri');
  }
}

var iPhone = new ApplePhone('Apple');
console.log(iPhone); // 這個與先前的建構式有接近的格式
iPhone.takePhoto();  // 由於沒有傳入相機功能，所以沒辦法
iPhone.callSomeone('小明'); // 能使用上一個建構式的方法
iPhone.hiSiri();  // 能使用新建構式方法
```

這個概念下也能夠繼承於現有的原型，如以下範例就是將 `MyPhones` 繼承於 Array 之下，這種繼承方法可以讓新的建構式擁有陣列的全部方法，也可以藉此增加新的方法。

```js
class MyPhones extends Array {
  constructor(name, ...phones) {
    super(...phones); // 繼承原本陣列的值
    this.name = name;
  }
  add (phone) { // 自訂的方法
    this.push(phone);
  }
}

const JayPhones = new MyPhones('杰倫', { name: 'iPhone' }, { name: 'Z' });
console.log(JayPhones.length); // 傳入兩個值作為陣列，所以長度確實是 2
JayPhones.add({name: 'G'}); // 再增加一個值
console.log(JayPhones.length); // 陣列長度改為 3
console.log(JayPhones.name); // '杰倫'：除了陣列外，名字也在裡面，因為陣列本質就是物件
```

JavaScript 中許多觀念很重要，其中之一則是原型。許多時候一些語法上的錯誤或是概念一時轉不過去，打開 console 看看物件的圓形，或許就能明白。

另外...，剩兩篇了!?
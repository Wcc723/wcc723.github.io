---
layout: post
title: 鐵人賽 19 - Bootstrap 一次看懂元件的使用組合
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/19_bootstrap_header.jpg
published: true
---

Bootstrap 的官方文件有完整的說明以及範例，就算是如此，還是會有許多朋友希望有快速入門的介紹，本篇就來介紹絕大部分 Bootstrap 元件的組合手法，搞懂一次後就能快速運用到其他模組上，甚至 Bootstrap 4 也是用相同的概念就能夠運用唷。

<!-- more -->

## 元件組合

Bootstrap 是標準的 OOCSS 概念下所設計的框架，也就如同樂高一樣可以反覆的堆疊，不過前提也是要在正確的卡楯上才能順利的接上。

以按鈕為例，一般來說會看到長長的一段說明怎麼使用，以及有哪些樣式、大小、狀態等等使用方法(除了按鈕以外，大部分的文件皆是如此)，如果是要熟悉 Bootstrap 一個一個邊看邊使用也需要很長的時間，這邊來介紹一下基本的運用：

![](/images/2016_ironman/19_bootstrap_01.png)

Bootstrap 在使用時，都會有個 `{ 模組 }` 作為元件的架構，所以按鈕就會有 `.btn` 然而這段也會混用在其他的延伸樣式上，如配色、樣式皆是如此，不過狀態就不會帶上 `.btn` 囉，這段要多注意一下。

這邊我們在列出常見的按鈕表格模組，這樣是不是一目了然呢？

| 模組            | 配色           | 樣式            | 狀態            |
| :------------- | :------------- | :------------- | :------------- |
| btn            | btn-primary    | btn-sm         | active         |
|                | btn-default    | btn-lg         | disabled       |
|                | btn-success    | btn-xs         |                |
|                | btn-info       | btn-block      |                |
|                | ...            |                |                ||



這時候如果在製作一個流程表單，要呈現用戶尚未填寫完成，需要一個較大的下一步按鈕並且加上不能點選的按鈕，我們就可以依上表格挑選。

| 模組            | 配色           | 樣式            | 狀態            |
| :------------- | :------------- | :------------- | :------------- |
| v **btn**      | btn-primary    | btn-sm         | active         |
|                | btn-default    | v **btn-lg**   | v **disabled** |
|                | v **btn-success**| btn-xs       |                |
|                | btn-info       | v **btn-block**|                |
|                | ...            |                |                ||


組出來的結果會是 `class="btn btn-success btn-lg disabled"` 這樣就能出現一個綠色，且不能點擊的大按鈕。

## 結構

以上案例可以套用在絕大部分的 Bootstrap 元件上，另外在介紹一下 Bootstrap 的元件模組結構，絕大部分如 btn、nav、navbar、progress、pagination... 都是用模組名稱在前，後方使用 `-` 帶入各種延伸的配色、樣式，而第一個模組名稱其實就是 `模組的結構` ，這個設計概念也是不斷的反覆出現結構與樣式分離，讓 Bootstrap 如此靈活的主要原因。

![](/images/2016_ironman/19_bootstrap_02.png)

## 結語

本篇的概念可以快速使用 Bootstrap 3 的模組，且對於往後的 Bootstrap 4 版本更是如此，這個概念會更加的明顯。當然我們在製作元件時如果能夠帶入這些觀念，也助於我們的元件開發。。

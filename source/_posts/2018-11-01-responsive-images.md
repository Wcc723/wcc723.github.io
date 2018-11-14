---
layout: post
title: 鐵人賽：網頁設計 - 響應式圖片選用技巧
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%20%EF%BC%91%EF%BC%90.png?alt=media&token=7480df17-3e1b-4c71-8e66-f139525102cc
published: true
---

網站上總需要圖片來點綴，除了客戶提供解析度不足的圖片外，我們也看從許多素材網站找到不錯的圖片，而選用圖片除了找到合適主題外，也需要花不少時間來比對是否合適於網站。

本篇依據 CSS 的觀念來提供一些選用圖片的技巧，藉此來減少 25% 搜尋素材的時間。

## 技術限制
響應式圖片運用上與技術限制有很大的關係，其中有兩個要點是必須要注意的：

* CSS 呈現圖片的方法
* 裝置尺寸變化

### CSS 呈現圖片的方法

以下圖來說是一張原始比例的圖片，長寬比約為 960:640，在 CSS 中如果需要限制為正方形的尺寸，常見手法是運用 background-size: cover 或 contain 的方式。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%203.png?alt=media&token=2f59e0bd-c999-4fa8-abc1-f2fb13746f95)

以下兩張圖片則是使用這兩種屬性，而前者是使用 `cover`，後者則是運用 `contain`(灰色為背景色彩)，運用上更是 `cover` 被許多設計師、開發者使用，這種方式盡可能在有限空間中呈現最多畫面。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%204.png?alt=media&token=2219f0b2-46e1-45f7-924d-0338b09c7bae)

`contain`：在有限空間中呈現完整圖片，畫面中的灰色部分則是背景。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%205.png?alt=media&token=00d7f6de-a3c4-4dba-b93f-f39dabad4fff)
圖片來源：https://unsplash.com

### 裝置寬度

由於圖片顯示區域會受到裝置寬度的影響，我們將上述的圖片分別放置在不同的尺寸上呈現，會得到如下的結果。

`960 * 450` 桌面版畫面：由於這張圖片的配置是屬於水平，且 **主體** 僅有佔少量空間，在橫向畫面上呈現沒有什麼問題。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%201.png?alt=media&token=b8821ced-720d-489d-9fae-8d2d716de395)

`360 * 450` 行動版畫面：雖然畫面偏向水平，但由於 **主體** 只有一張椅子，畫面縮小後椅子只要能完整呈現，依然沒有什麼問題。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%202.png?alt=media&token=a94d733e-e618-4276-8494-e76bd3e62679)

接下來，我們選用另一張圖片來做介紹：

`960 * 450` 桌面版畫面：畫面中沙發是主體，完整地在畫面中間，在桌面版沒有什麼問題。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%206.png?alt=media&token=caf2217d-65c6-48e3-b786-f01b6cbf7749)

`360 * 450` 行動版畫面：但由於 **主體** 是橫式的，在行動版的垂直小空間中就顯得明顯不足，這樣導致了畫面左右方被裁切掉，這樣的圖片就不太合適。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%207.png?alt=media&token=c9856831-98aa-46ea-bc63-51129e0e2865)

## 快速驗證方法

CSS background cover 方式會盡可能的呈現完整圖片，而呈現的空間是可以再透過 x, y 軸線做定位上的為條（通常預設為中間或固定的四個邊角）。

接下來可以先透過繪圖軟體準備好裁切空間，上面包含了桌面版空間及行動版空間，兩個空間的交疊處則是安全區域。

* 主體必須比重疊安全區域還要小
* 桌面版空間可以水平呈現

如下圖，既可以呈現完整畫面，也同時可以測試重疊區域是否有足夠空間。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%20%EF%BC%91%EF%BC%90.png?alt=media&token=7480df17-3e1b-4c71-8e66-f139525102cc)


接下來把裁切區域套用在畫面上即可得到以下結果。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FArtboard%20%E2%80%93%208.png?alt=media&token=dce4aafe-67c3-4330-97f4-7f3168b9c602)

## 結語

視覺也有不同的邏輯，而這個邏輯並非能用程式邏輯完整的解釋，本篇直接透過實際的案例解釋圖片選擇方式，讓大家在選圖上可以節省一些時間。
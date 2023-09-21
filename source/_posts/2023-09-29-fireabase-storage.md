---
layout: post
title: Firebase Storage 申請設定以及 Node.js 串接方式
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FArtboard%20Copy%2012.jpg?alt=media&token=ef9c6b6e-c510-4dce-a1c0-f1d08ccc6549
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/H4GmskFhSJQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

我很喜歡使用 Firebase Storage，相對於 AWS S3 來說，Firebase Storage 的設定、管理更加容易，而且還有提供每日免費額度，相當適合小型專案使用，而我的 Blog 圖片來說，絕大部分也都是上傳到 Firebase Storage。

本篇將會介紹 Firebase Storage 及設定流程，並在後方附上相關程式碼以供直接運用。

進入  [Firebase Console](https://console.firebase.google.com/u/0/) 選擇新增專案，輸入名稱後可以一直繼續到底（分析可以取消就是了，但不影響運作）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FECE551C1-BEA7-482A-BC7A-0689F13019DB.png?alt=media&token=0ccb4089-fa25-42e0-b983-f3d93488af54)

專案建立以後，在畫面的左上方，點選齒輪符號，按下專案設定。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_17_11_27.png?alt=media&token=ef90293d-a419-40b4-a877-fe49f58271c1)

其中找到「服務帳戶」，下方可以建立新的私密金鑰，私密金鑰是採用 JSON 提供，僅會提供一次，請確實地找地方儲存，並且避免遺失及落入他人手中。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_17_11_28.png?alt=media&token=e6716e4d-7a8f-47f2-ae04-e199342e0575)

在左側選單，點選 Storage。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_17_11_29.png?alt=media&token=d2ab2ec8-ce8c-430a-8fe6-0940cc02fb9b)

接下來會在啟用前有基本的設定。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDC1F6B80-A4B1-497A-8D22-BEFCA64D178B.png?alt=media&token=41eb69ea-8d13-4873-9a07-1a1b8e3cb9ed)

接下來可以選擇地區，一樣依據你服務的用戶位置做選擇。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F258A84C1-3EDB-46CF-8A76-7D94809A8446.png?alt=media&token=fafd02ca-9ec3-4645-bd07-bc4d4875f7f1)

建立後，可以看到 `gs://...` 的路徑，請先複製起來，在後面的環境變數中需要填寫這段路徑。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_17_11_30.png?alt=media&token=a8bdb2f7-b71d-45b5-9eda-557b239bf52f)

因為預設的 Storage 是無法被直接存取的，因此需要調整規則，讓檔案直接公開能夠讓任何人存取。
切換到「Rules」分頁，將新的規則貼入（附在下方），接下來按下「發布」。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_17_11_30%202.png?alt=media&token=7ceb7c57-7d15-4273-9f8f-5f396f90c5ea)

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // allow read, write: if request.auth!=null;
      allow read, write: if true;
    }
  }
}
```

## 回到程式碼

在此有提供完整的 Node.js 程式碼，依據需求將 Firebase Storage 申請的資料填入 `.env` 即可（請參照 `.env.sample` ）。

完整範例：https://github.com/Wcc723/node-ironman-sample-2023/tree/feature/firebase-storage-upload

如果在開發上有問題，建議參考本影片，會帶你從頭開始申請並上傳圖片喔：https://youtu.be/H4GmskFhSJQ
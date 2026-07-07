---
layout: post
title: Anthropic Getting started with loops（Loop Engineering 入門）| 翻譯文
category: development
tagline:
tags: [AI, Claude Code]
description: Anthropic 介紹 Claude Code 如何實踐 Loop Engineering 的文章翻譯，把 agent 的工作循環依觸發與停止方式分成回合式、目標式、時間式、主動式四種，並說明如何控管 token 與維持程式碼品質。
cssdemo: 
jsdemo:
thumbnail: https://img.casper.tw/posts/2026-07-07-anthropic-loop-engineering/cover.png
photo: 
published: true
---

最近 Loop Engineering 這個詞非常的火紅，那 Anthropic 也推出一篇文章，專門在介紹 Claude Code 如何做到 Loop Engineering。

雖然它沒有明確地提到 Loop Engineering，但是整篇文章其實都在說明這個相關的概念。如果你有興趣的話，可以透過此[連結](https://x.com/ClaudeDevs/article/2074208949205881033) 看到原文。

本篇是翻譯成繁體中文版的版本。

## 重點摘要（TL;DR）

**一句話：** Loop 就是「agent 反覆執行工作循環，直到滿足停止條件為止」。依「誰觸發、何時停、用哪個功能」可分成四種——**由手動到全自動、由簡單到複雜**，請從最簡單的開始，按需選用。

### 四種 Loop 一覽

| Loop 類型 | 你交出去的是… | 何時用它 | 觸發 | 停止 | 主要功能 |
| --- | --- | --- | --- | --- | --- |
| **回合式 Turn-based** | 每一回合的「檢查」由你做 | 你在探索或還在做決定 | 一個 prompt | Claude 判斷完成 | 自訂驗證 skill |
| **目標式 Goal-based** | 交出「停止條件」讓 Claude 自己判斷 | 你已知道「完成」長什麼樣 | 手動 prompt | 達標或到回合上限 | `/goal` |
| **時間式 Time-based** | 交出「觸發時機」 | 工作在專案外、按排程發生 | 時間間隔 | 你取消或工作完成 | `/loop`、`/schedule` |
| **主動式 Proactive** | 連「下 prompt」都交出去 | 工作重複且定義明確 | 事件／排程（無人即時介入） | 任務達標即退；routine 到你關閉 | 以上全部 + 動態工作流 |

> **選擇心法：** 從「你自己是瓶頸」的任務下手，問自己能把哪一塊交出去——能寫出驗證檢查？→ 回合式 skill；目標夠明確？→ `/goal`；工作按排程進來？→ `/loop`／`/schedule`。

### 兩個共通原則

- **維持品質：** 保持 codebase 乾淨、用 skill 編碼「怎樣算好」讓 Claude 自我驗證、用第二個 agent 做 code review；遇到不合標準的結果，別只修個案，把它編碼回系統。
- **控管 token：** 選對 primitive 與模型、定清楚成功／停止標準、大規模前先試跑、確定性工作交給腳本、別跑得比需要更頻繁，並用 `/usage`、`/workflows` 檢視用量。

---


現在大家常在談「設計 loop（迴圈）」而不是單純對 coding agent 下 prompt。但如果你上 X 想搞清楚 loop 到底是什麼，會看到各式各樣的說法。

在 Claude Code 團隊，我們把 **loop 定義為：agent 反覆執行工作循環，直到滿足某個停止條件為止**。我們依據以下幾點來分類不同的 loop：

- 如何被觸發（triggered）
- 如何停止（stopped）
- 使用了哪個 Claude Code primitive（原語 / 基礎功能）
- 最適合哪一種任務

以下會介紹主要的 loop 類型、各自的使用時機，以及如何在控制 token 用量的同時維持程式碼品質。**並不是所有任務都需要複雜的 loop；請從最簡單的解法開始，有選擇性地使用這些模式。**

## 四種 Loop 類型速覽

| Loop 類型 | 觸發方式 | 停止條件 | 最適合 | 使用的功能 |
| --- | --- | --- | --- | --- |
| **回合式 Turn-based** | 使用者的 prompt | Claude 判斷任務完成，或需要更多脈絡 | 短任務、非例行性工作 | 自訂驗證 skill |
| **目標式 Goal-based** | 即時手動 prompt | 達成目標，或到達回合上限 | 有可驗證退出條件的任務 | `/goal` |
| **時間式 Time-based** | 指定的時間間隔 | 你取消，或工作完成 | 例行工作、對接外部系統 | `/loop`、`/schedule` |
| **主動式 Proactive** | 事件或排程（過程中無人即時介入） | 每個任務達標即退出；routine 本身持續到你關閉 | 定義明確的重複性工作流 | 以上全部 + 動態工作流 |

## 1. 回合式 Loop（Turn-based）

![回合式 Loop（Turn-based）示意圖](https://img.casper.tw/posts/2026-07-07-anthropic-loop-engineering/image.png)

- **觸發：** 使用者的一個 prompt
- **停止：** Claude 判斷已完成任務，或需要更多脈絡
- **最適合：** 較短、不屬於例行流程或排程的任務
- **控管用量：** 寫更具體的 prompt，並用 skill 強化驗證，以減少回合數

你送出的每一個 prompt，其實都啟動了一個由你主導、逐回合推進的手動 loop。Claude 會蒐集脈絡、採取行動、檢查成果、必要時重複，最後回覆你。我們稱之為 **agentic loop（代理迴圈）**。

例如：請 Claude 做一個「讚」按鈕。它會讀你的程式碼、進行修改、跑測試，然後把它認為可行的結果交還給你。接著換你手動檢查，再寫下一個 prompt。

你可以把自己手動檢查的步驟寫成一份 **SKILL.md**，讓 Claude 能端到端地檢查更多自己的工作，藉此改善「驗證」這一環。這份 skill 應該包含讓 Claude 能看見、量測或操作結果的工具或連接器。**檢查越量化，Claude 就越容易自我驗證。**

## 2. 目標式 Loop（Goal-based，`/goal`）

![目標式 Loop（Goal-based）示意圖](https://img.casper.tw/posts/2026-07-07-anthropic-loop-engineering/image-1.png)

- **觸發：** 即時的手動 prompt
- **停止：** 達成目標，**或**到達你設定的最大回合數
- **最適合：** 有可驗證退出條件的任務
- **控管用量：** 設定具體的完成標準與明確的回合上限，例如「試 5 次後停止」

有時一個回合不夠，複雜任務尤其如此。Agent 在能反覆迭代時表現更好。你可以用 `/goal` 定義「怎樣算完成」，來延長 Claude 迭代的時間。

當你定義了成功標準，Claude 就不必自行判斷什麼叫「夠好」而提早結束 loop。每當 Claude 想停下來，一個評估模型（evaluator model）會檢查你的條件，若未達成就把它送回去繼續做，直到達成目標或用完你設定的回合數。

這也是為什麼**確定性的標準**特別有效，例如「通過幾個測試」或「達到某個分數門檻」。

範例：

```bash
/goal get the homepage Lighthouse score to 90 or above, stop after 5 tries.
```

## 3. 時間式 Loop（Time-based，`/loop` 與 `/schedule`）

- **觸發：** 指定的時間間隔
- **停止：** 你取消，或工作完成（PR 已合併、佇列已清空）
- **最適合：** 例行性工作，或需要對接外部環境／系統
- **控管用量：** 拉長間隔，或改用「事件驅動」而非「時間驅動」

有些代理工作是重複性的：任務不變，只有輸入改變，例如每天早上摘要 Slack 訊息。另一些工作則依賴外部系統，而對接的簡單方法就是**定時去查看、並對變化做出反應**，例如一個可能收到 code review 或 CI 失敗的 PR。

這類情況可以用 `/loop`，它會依間隔重複執行一個 prompt。範例：

```bash
/loop 5m check my PR, address review comments, and fix failing CI
```

`/loop` 跑在你自己的電腦上，所以你關機它就停了。你可以用 `/schedule` 建立一個 routine，把 loop 搬到雲端。

## 4. 主動式 Loop（Proactive）


![主動式 Loop（Proactive）示意圖](https://img.casper.tw/posts/2026-07-07-anthropic-loop-engineering/image-2.png)

- **觸發：** 事件或排程，過程中無人即時介入
- **停止：** 每個任務達成目標就退出；routine 本身會一直跑到你把它關掉
- **最適合：** 定義明確的重複性工作流：bug 回報、issue 分流、遷移、相依套件升級等
- **控管用量：** 把 routine 導向較小、較快的模型，判斷性的環節才用最強的模型

上述這些 primitive，加上 Claude Code 的其他功能——如 auto mode（自動模式）與動態工作流（dynamic workflows，研究預覽階段）——可以組合成一個處理長時間工作的 loop。

例如，要處理源源不絕的意見回饋，你可以用：

- **`/schedule`**（研究預覽）跑一個 routine，定時檢查是否有新回報
- **`/goal`** 定義「怎樣算完成」，並用 skill 記錄如何驗證
- **動態工作流** 來編排 agent，分流每則回報、修正它、再審查修正結果
- **Auto mode** 讓 routine 不必停下來問權限就能持續執行

組合起來的 prompt 可能長這樣：

```bash
/schedule every hour: check the project-feedback channel for bug reports. /goal: don't stop until every report found this run is triaged, actioned, and responded to. When fixing a bug, use a workflow to explore three solutions in parallel worktrees and have a judge adversarially review them.
```

## 維持程式碼品質

Loop 的產出品質取決於它周遭的系統。設計系統時：

- **保持 codebase 本身乾淨：** Claude 會沿用你 codebase 中既有的模式與慣例。
- **給 Claude 自我驗證的方法：** 用 skill 把「你和團隊心中的好」編碼起來。
- **讓文件容易取得：** 框架與函式庫的文件有最新的最佳實務。
- **用第二個 agent 做 code review：** 一個脈絡全新的審查者比較沒有偏見，也不會被主 agent 的推理帶著走。可用內建的 `/code-review` skill，或 GitHub 的 Code Review。

當某個結果不符標準時，別只停在修好這個個案——試著把它編碼進系統，讓未來所有迭代都受惠。

## 管理 Token 用量

要控管 token 用量，loop 應該要有清楚的邊界：

- **為任務選對 primitive 與模型：** 小任務不需要多個 agent 或 loop；有些任務可以用更便宜、更快的模型。
- **定義明確的成功與停止標準：** 具體說明「完成」的樣子，讓 Claude 能更快抵達解答（但也別太快）。
- **大規模執行前先試跑：** 動態工作流可能生出數百個 agent，先用一小部分工作估算用量。
- **確定性的工作用腳本處理：** 跑腳本比逐步推理便宜。例如 PDF skill 可以附帶一支填表腳本讓 Claude 每次直接執行，而不是每次重新推導程式碼。
- **別讓 routine 跑得比需要的更頻繁：** 把間隔對齊你所監看對象實際變化的頻率。
- **檢視用量：** `/usage` 指令會依 skill、subagent、MCP 拆解近期用量；`/goal` 不帶參數會顯示目前的回合數與 token 用量；`/workflows` 會顯示每個 agent 的 token 用量，而且你隨時可以停掉某個 agent。

## 開始上手

從你已經在做的工作著手。挑一個**你自己是瓶頸**的任務，問問看有哪一塊可以交出去：你能寫出驗證檢查嗎？目標夠明確嗎？工作是不是按排程進來的？

有了想法就實際跑一次 loop，觀察結果——看它在哪裡卡住、在哪裡做過了頭——然後別怕去反覆調整它。

更多資訊請參閱 Claude Code 文件中關於平行執行 agent、以及 loop、schedule、goal、動態工作流的頁面。

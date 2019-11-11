---
layout: post
title: 自建 Name Server
category: dns
tagline:
tags: [dns]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2FArtboard%20Copy%206.png?alt=media&token=c5d8c7a1-b5d4-459a-b3b1-958a16d16359
published: true
---

本篇教學是延續「[大神來六角](https://www.hexschool.com/2019/03/07/2019-03-07-interview/)」的 "網址管理與 DNS 託管全攻略"，目的是讓參與的學員更了解 DNS 在轉址的過程觀念。

對於 Name Serve 的概念可以參考 [AWS 提供的架構圖](https://aws.amazon.com/tw/route53/what-is-dns/#DNS_%E5%A6%82%E4%BD%95%E5%B0%87%E6%B5%81%E9%87%8F%E8%B7%AF%E7%94%B1%E5%88%B0_Web_%E6%87%89%E7%94%A8%E7%A8%8B%E5%BC%8F%EF%BC%9F)：

![](https://d1.awsstatic.com/Route53/how-route-53-routes-traffic.8d313c7da075c3c7303aaef32e89b5d0b7885e7c.png)

擁有一個網域後，只要網域的供應商可以設定 NS Record，都可以用來自行建立 Name Server，並且可以自行代管該網域下的所有子網域。

> 本篇中的環境在教學結束後被釋放，所以無法再次連接。

參考文章：
-  [http://linux.vbird.org/linux_server/0350dns.php#DNS_Zones](http://linux.vbird.org/linux_server/0350dns.php#DNS_Zones) 
-  [https://eric0806.blogspot.com/2014/06/ubuntu-bind9-dns-server.html](https://eric0806.blogspot.com/2014/06/ubuntu-bind9-dns-server.html) 

## 建立環境

- 購買一個網域，並且該網域可以自訂 NameServer 的
	- 本次服務購買 GoDaddy
- 準備一台主機，本次使用 Digital Ocean 的 Ubuntu 16

## 上層 Name Server 設定

首先，必須先將給予自訂的 Name Server 一個網址，如果僅有 IP 的情況下將無法自訂 Name Server，在此先給予我的主機 dns 這個名稱：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_4_21_%E4%B8%8B%E5%8D%882_59.png?alt=media&token=39b0e838-7bf6-468f-85ef-4d5c0ae11543)

接下來將 customdns 這個名稱交給予 dns.casper.tw 這個 Name Server 代管，因此：
- `dns.casper.tw` 這是 Name Server 主機
- `customdns.casper.tw` 這是 Name Server 主機所代管的網域，接下來可以自訂 `{{ xxx }}.customdns.casper.tw` 的網址在這個網域下。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2F809515F0-8C63-4B53-A9BE-A688F68F0D19.png?alt=media&token=91861918-2f76-4e8b-8a6f-a7923b0fb550)

## Name Server 設定

在此，會使用 **Bind** 這一個 Name Server 工具，本工具有許多觀念需要理解，會在接下來的流程中一一的說明：

安裝 Bind 工具：
```shell
sudo apt-get install bind9 bind9-doc dnsutils
```

安裝完成後進入 `/etc/bind` 的套件下，輸入 `ll` 可以看到以下的資料結構：

```shell
$ ll
```
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_4_16_%E4%B8%8B%E5%8D%8810_00.png?alt=media&token=bb953ffd-a08f-4b0d-90eb-d88e289653f1)

主要調整檔案：
- `named.conf.options`：主要的 DNS 工具的選項。
- `named.conf.local`：設定管理的 IP、正反解的對應檔案路徑、次要 Name Server 的設定等等。
- 自訂檔案：
	- `/zones/{{customdns.casper.tw}}.tw` 正解檔
	- `/zones/{{ xxxip.rev }}` 反解檔
- 其它 `/etc/default/bind9`：修正 ipv4、ipv6 的問題

`Bind` 設定檔撰寫的過程中，會不斷的重啟、除錯，以下列出重要的語法：
- `/etc/init.d/bind9 restart`：重啟。
- `/etc/init.d/bind9 status`：目前機器的狀態，必須要調整到沒有錯誤訊息為止。

### 設定 named.conf.options

透過編輯器設定 `named.conf.options`，這是 bind 工具的主要項目，按照預設也不會有太大關係，但本次是以 ipv4 為主，所以 v6 的功能可以先關閉，另外 Name Server 預設是 53 port，當上層網域指定過來後就會自動用 53 的接口，所以不要隨意調整。

```
acl intra { xx.xx.xx.xx; };
// 自訂義變數 intra，可查詢的 DNS 主機，不設定也沒關係
options {
        directory "/var/cache/bind";
        dnssec-validation auto;

        auth-nxdomain no;    # conform to RFC1035
        listen-on port 53 { any; };
        allow-query { any; };
        allow-query-cache { none; };
        recursion no; 
        // allow-recursion { intra; };
        also-notify { };
};
```

### 設定 named.conf.local

這是與配置檔案連接的檔案，算是主要的進入點，透過這個檔案與正解、反解配置檔案產生關聯。

另外 Name Server 可以設定超過一台主要的為 Master，其它次要的為 Slave，在這個範例中僅設定一個主要，實作中會建議另外設定 Slave，避免主要的機器無法連接導致所有網址失聯。

```js
acl allow-trans-ip { 138.68.229.69; };
// 定義允許取得配置的 ip ，如果有多個 ip 可以使用分號隔開

// --- 正解的區域 ---
// 定義掌管的 Domain
zone "customdns.casper.tw" {
    type master; // 定義 master 或 slave
    file "/etc/bind/zones/customdns.casper.tw.fwd"; // 自訂義正解檔案的路徑，名稱可自訂
    
    // 定義可以從主要機器取得配置的 ip，在此不設定也沒關係，但實作中建議加上
    allow-transfer {
        allow-trans-ip; // 上方定義的變數
    };
}
 
// --- 反解的區域 ---
zone "229.68.138.in-addr.arpa" {
    type master; // 對應 master
    file "/etc/bind/zones/138.68.229.rev"; // 反解配置檔案路徑
    allow-transfer { allow-trans-ip; }; // 同上
};
// 反解命名規則：
// ip 假設為 138.68.229.69
// 反解應設定為 229.68.138.in-addr.arpa
```

### 設定正反解配置檔案

上方定義了 `named.conf.local`，其中又連向兩個配置檔案，分別為：
- `/etc/bind/zones/customdns.casper.tw.fwd` 正解
- `/etc/bind/zones/138.68.229.rev` 反解

而這兩個檔案名稱是可以自訂的，在此僅是依據所管理的網域及反解路徑命名，首先設定 `customdns.casper.tw.fwd` 正解檔案：

```
$TTL    120
;
@       IN      SOA     customdns.casper.tw. xxx.gmail.com. (
                        2014062007;
                        600;
                        900;
                        86400;
                        120);

;
@       IN      NS      dns.casper.tw.;

dns.casper.tw.       IN      A       165.22.129.123;
www.customdns.casper.tw.     IN      A       138.68.229.69;
```

分別說明以上檔案分別包含什麼內容：
- 定義 TTL 變數，單位是 "秒"，時間越短用戶就需要更頻繁的詢問
- 定義 SOA，SOA 算是 Name Server 的申明檔案，其中也包含該伺服器的管理者聯絡方式：
	- `customdns.casper.tw.` Master DNS 伺服器主機名稱，後方的 `.` 是不能省略的
	- `xxx.gmail.com. ` 負責該網域的聯絡人，gmail 前方的 @ 被轉為 `.`
	- `2014062007` 序號 (Serial)，在此可以思考為版本號，slave 用此來判斷 master 是否有更新
	- `600` slave 的更新頻率
	- `900` 當 Slave 連線失敗重新嘗試時間 (Retry)
	- `86400`失效時間 (Expire)，當 Slave 重新連線到達多少時間會停止嘗試，屆時需要管理員處理。
	- `120` TTL 預設時間
- 定義 Name Server
	- NS：Name Server 縮寫
	- `dns.casper.tw.` Name Server 位置
- 定義 Record 參數
	- `www.customdns.casper.tw.` 自訂義網址
	- `138.68.229.69` 對應 ip

> 反解：一般網域查詢時是由右至左，如：.root > .tw > .casper > .dns，而 ip 的運作是相反的，上述的 ip 中在運作時方向為 138 > 68 > 229 > 69，用來從 ip 反向查詢到主機名稱。

定義反解檔案 `138.68.229.rev`，反解檔案的 SOA 與正解檔一致，不同的是 Record 內容：
```
$TTL    3600
;
@       IN      SOA     customdns.casper.tw. agito723.gmail.com. (
                        2014062007;
                        600;
                        900;
                        86400;
                        120);


@       IN      NS      dns.casper.tw.
;
123.129.22.165.in-addr.arpa.     IN      PTR     dns.casper.tw. ;
69       IN      PTR     www.customdns.casper.tw. ;
```
反解檔案與正解檔案設定差異不大，規則上定義為 `PTR`(反解 Record)，並且在 ip 需要使用反解的規則撰寫。到這個步驟基本上就算完成了，接下來就是進入測試、重啟與除錯。

## 重啟及除錯

接下來，輸入 `/etc/init.d/bind9 restart` 就可以重啟測試，重啟後建議再輸入 `/etc/init.d/bind9 status` 來除錯，以下列出常見的錯誤：

遇到的問題：
#### network unreachable resolving
```
network unreachable resolving 'ns39.domaincontrol.com/AAAA/IN': 2001:503:d414::30#53
```
解法：
```
#編輯 /etc/default/bind9
gedit /etc/default/bind9

# 如下，加上 -4
# startup options for the server
OPTIONS="-4 -u bind"
```

#### bad dotted quad

設定檔中包含了不正常的空格，這些空格有可能在分號後方，可依據錯誤訊息尋找是否有多餘的空格。

正常的 status 運作應會出現以下訊息，並且沒有任何的紅色文字：
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2F548C775E-8362-4F11-BECE-74F54490082F.png?alt=media&token=e0862396-afaf-45d1-a9a1-51d4bbf9e021)

## Name Server 開張

如果沒有任何錯誤，正常來說就能直接連線至你的網址。接下來再透過 `dig +trace { 網址 }` 也能看到自建的 Name Server 相關訊息。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201904%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_4_21_%E4%B8%8B%E5%8D%884_05.png?alt=media&token=c8447166-7010-463e-ba7d-bb02dc8e8118)


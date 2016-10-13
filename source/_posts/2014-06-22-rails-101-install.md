---
layout: post
title: Rails 環境建設
category: rails
tagline: 
tags: [ruby, rails]
cssdemo: 2014-spring
thumbnail: screen_shot_rails101_0622.png
published: true
---


最近要學的技術有兩個，一個是D3.js，另一個是Rails，目前是參考Xdite所提供的Rails 101，安裝過程中有發生些小問題，所以特別記錄起來，以免之後要在裝的時候忘記...。

Rails不是要打算精通後端，而是希望了解，以便往後再配合後端時能更有效率的處理問題。

<!-- more -->

## 安裝環境

- 參考的書籍：Rails 101 [https://leanpub.com/rails-101](https://leanpub.com/rails-101)
- 硬體：Macbook pro retina 2013
- 系統版本：OSX 10.9.3


![](/images/rails_base/rails_install/screen_shot_rails00.png)

## 安裝Homebrew

在PDF書上第一個要安裝的，會想要記錄也是以下這原因...。

![](/images/rails_base/rails_install/screen_shot_rails01.png)

以上的圖是書上的範例，直接複製會得到以下的結果...，沒有空白鍵啊!!!重點是我找不到原因還卡很久...

	ruby-e"$(curl-fsSLhttps://raw.github.com/Homebrew/homebrew/go/install)"

所以沒意外的話應該是以下指令

	ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

![](/images/rails_base/rails_install/screen_shot_rails02.png)
![](/images/rails_base/rails_install/screen_shot_rails03.png)

想說我有裝git了，跳過`brew install git`，直接升級。

	brew update


![](/images/rails_base/rails_install/screen_shot_rails04.png)

	brew tap homebrew/dupes

`brew install apple-gcc42`怎好像沒截到圖
...。

![](/images/rails_base/rails_install/screen_shot_rails05.png)

## 安裝 XQuartz

安裝XQuartz。

![](/images/rails_base/rails_install/screen_shot_rails06.png)

安裝完後登出在登入。

![](/images/rails_base/rails_install/screen_shot_rails07.png)

## 安裝 ImageMagick / MySQL

別懷疑，這邊我完全不懂，只知道MySQL是資料庫。

	brew install imagemagick


*透過brew安裝時，圖示都變成啤酒了...*

![](/images/rails_base/rails_install/screen_shot_rails08.png)
<!-- ![](/images/rails_base/rails_install/screen_shot_rails09.png) -->
	
	Installing mysql

![](/images/rails_base/rails_install/screen_shot_rails10.png)

	unset TMDIR

這個用了沒感覺(跳過...)

	mysql_install_db --verbose --user=`whoami` --basedir="$(brew--prefixmysql)" -\

![](/images/rails_base/rails_install/screen_shot_rails11.png)

	sudo mysqladmin -u root password '123456'

![](/images/rails_base/rails_install/screen_shot_rails12.png)

	mkdir -p ~/Library/LaunchAgents

這個用了沒感覺(跳過...)

	

![](/images/rails_base/rails_install/screen_shot_rails13.png)

	find /usr/local/Cellar/mysql/ -name "homebrew.mxcl.mysql.plist" -exec cp {} ~/Library/LaunchAgents/ \;


	launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist


![](/images/rails_base/rails_install/screen_shot_rails14.png)

## 安裝 RVM

透過rvm就可以執行特定版本的ruby及gems，rails的版本演進相當快，所以必須透過RVM來切換不同的rails版本。

	bash -s stable < <(curl -s https://raw.github.com/wayneeseguin/rvm/master/binscripts/rvm-installer)

![](/images/rails_base/rails_install/screen_shot_rails14.5.png)
	
	. ~/.profile
	$source ~/.profile

![](/images/rails_base/rails_install/screen_shot_rails15.png)

## 安裝 Ruby 2.0

	brew install libyaml

![](/images/rails_base/rails_install/screen_shot_rails16.png)

	rvm pkg install openssl

![](/images/rails_base/rails_install/screen_shot_rails17.png)

	rvm install 2.0.0
	--with-openssl-dir=$HOME/.rvm/usr
	--verify-downloads 1

很順利，忘記截圖...

`rvm use 2.0.0`，這段我出了點問題，於是上網找了其他解法，依序輸入以下幾行。

	source ~/.rvm/scripts/rvm
	type rvm | head -n 1
	rvm use 2.0.0
	
![](/images/rails_base/rails_install/screen_shot_rails18.png)

## 安裝必要 Ruby gems

	gem install rails --version 4.0.0

![](/images/rails_base/rails_install/screen_shot_rails19.png)
<!-- ![](/images/rails_base/rails_install/screen_shot_rails20.png) -->

	gem install mysql2

![](/images/rails_base/rails_install/screen_shot_rails21.png)

	gem install capistrano

![](/images/rails_base/rails_install/screen_shot_rails22.png)

	gem install capistrano-ext

![](/images/rails_base/rails_install/screen_shot_rails23.png)

## 設定 HTTP Server (使用 Pow)

簡單來說，就是看`localhost:3000`不爽，要換掉的意思!?

	curl get.pow.cx | sh

![](/images/rails_base/rails_install/screen_shot_rails24.png)


	gem install powder

![](/images/rails_base/rails_install/screen_shot_rails25.png)


Pow用法，方法一

>	cd ~/.pow/
>	ln -s ~/projects/wiki

方法二

>	powder link

Rails安裝環境相當複雜，如果沒有記錄，到時候也是會卡在相同的地方...。

安裝環境 全劇終...
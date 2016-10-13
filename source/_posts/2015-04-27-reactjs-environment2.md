---
layout: post
title: Middleman + Reactjs 
category: js
tagline: 
tags: [js, reactjs]
cssdemo: 2015-spring
jsdemo: 
thumbnail: 
published: true
---

上一篇是使用gulp來轉換jsx，這篇是介紹用middleman 結合 React.js。


<!-- more -->

## Middleman建立專案

參考本篇請先安裝好middleman，如果沒有可參考以下連結[/tools/2015/03/23/middle-intro/](/tools/2015/03/23/middle-intro/)。

建立middleman專案，並且安裝middleman-react的gem。

	$ middleman init React-middleman
	$ gem install middleman-react

`Gemfile`內請加入以下這行。 

	gem "middleman-react"


`config.rb`加入以下程式碼

	# activate react
	# 啟用React 
	activate :react

	# option if need Sprockets loading
	# 可以載入 react.js 
	after_configuration do
	  sprockets.append_path File.dirname(::React::Source.bundled_path_for('react.js'))
	end


如果剛剛有啟用`Sprockets loading`，可以打開all.js做以下調整(用途是合併react.js)，請先載入`react`，再載入其他script，如下範例。

	//= require react
	//= require_tree .


最後在`***.jsx`內就可直接使用jsx格式(和其他javascript放在同層即可)，如果執行`middleman server`時出現以下錯誤：

	Invariant Violation: _registerComponent(...): Target container is not a DOM element

請將你的`<%= javascript_include_tag  "all" %>` 放在 `<body>`的後方。
---
layout: post
title: Reactjs 元件的生命週期
category: js
tagline: 
tags: [js, reactjs]
cssdemo: 2015-spring
jsdemo: 
thumbnail: 
published: true
---

這篇也是React.js的學習過程文章。

<!-- more -->

參考文章：[http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/](http://tylermcginnis.com/reactjs-tutorial-a-comprehensive-guide-to-building-apps-with-react/)


## 元件生命週期

上一篇有提到`元件生命週期`，這邊照著做來瞭解以下的內容。

- Component LifeCycle - 元件生命週期
  - componentWillMount – 元件建立
  - componentDidMount – 元件已經建立
  - componentWillReceiveProps – This life cycle is not called on the initial render, but is instead called whenever there is a change to props. Use this method as a way to react to a prop change before render() is called by updating the state with setState.(原文)
  - componentWillUnmount – This life cycle is invoked immediately before a component is unmounted from the DOM. This is where you can do necessary clean up. For example, going back to out firebase example this is the life cycle event where you would clean up your firebase reference you set in componentWillMount.(原文)

```javascript
var LifeCycle = React.createClass({
  getInitialState: function(){
    // 元件初始化
    alert('getInitialState 的狀態');
    return {
      name: '比克'
    }
  },
  textClick: function(){
    this.setState({
      name: '悟飯'
    })
  },
  componentWillMount: function(){
    // 元件即將建立
    alert('componentWillMount 的狀態');
  },
  componentDidMount: function(){
    // 元件建立
    alert('componentDidMount 的狀態');
  },
  componentWillReceiveProps: function(){
    // 尚未測試出來
    alert('componentWillReceiveProps 的狀態');
  },
  render: function(){
    return(
      <div onClick={this.textClick}>
        必殺, {this.state.name} {this.props.skill}
      </div>
    )
  }
});

React.render(<LifeCycle skill="魔貫光殺砲" />,
document.getElementById('app')
);
```

<a class="jsbin-embed" href="http://jsbin.com/xaxicigedi/2/embed?html,js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>
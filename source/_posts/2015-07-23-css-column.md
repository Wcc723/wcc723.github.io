---
layout: post
title: CSS column 教學
category: css
tagline:
tags: [css]
cssdemo: 2015-summer
jsdemo:
thumbnail: 2015-07-23_screen_shot.jpg
published: true
---

CSS column對於文字排版有很大的幫助，就類似Adobe indesign在文字排版時，只要指定文字欄數，再將文字全部匯入即可。這樣在文字編排時則會以內容為優先，並非受限於html規則。

<!-- more -->

## 簡單範例

可以直接透過以下範例，操作互動來了解CSS column各個屬性的操作結果，試試看以後再來了解各屬性的用途。

{% raw %}
<div class="d0722 demo">
  <div style="display: flex">
    <div style="flex: 1">
      <div>column-count</div>
      <label><select id="column-count">
        <option value="auto">auto</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select></label>
    </div>
    <div style="flex: 1">
      <div>column-width</div>
      <label>
        <select id="column-width">
          <option value="100px">100px</option>
          <option value="150px">150px</option>
          <option value="200px">200px</option>
          <option value="250px">250px</option>
          <option value="300px">300px</option>
        </select>
      </label>
    </div>
    <div style="flex: 1">
      <div>column-gap</div>
      <label><select id="column-gap">
        <option value="0">0</option>
        <option value="5px">5px</option>
        <option value="10px">10px</option>
        <option value="15px">15px</option>
        <option value="20px">20px</option>
        <option value="30px">30px</option>
      </select></label>
    </div>
    <div style="flex: 1">
      <div>column-rule-style</div>
      <label>
        <select id="column-rule-style">
          <option value="none">none</option>
          <option value="solid">solid</option>
          <option value="dashed">dashed</option>
          <option value="dotted">dotted</option>
        </select>
      </label>
    </div>
    <div style="flex: 1">
      <div>column-rule-width</div>
      <label><select id="column-rule-width">
        <option value="0">0</option>
        <option value="1px">1px</option>
        <option value="2px">2px</option>
        <option value="5px">5px</option>
        <option value="8px">8px</option>
      </select></label>
    </div>
  </div>
  <hr>
  <div style="display: flex">
    <div style="flex: 1">
      <div>column-rule-color</div>
      <label><input type="color" id="column-rule-color" /></label>
    </div>
    <div style="flex: 1">
      <div>h3 : column-span</div>
      <label>
        <select id="column-span">
          <option value="none">none</option>
          <option value="all">all</option>
        </select>
      </label>
    </div>
    <div style="flex: 1">
      <div>column-break-inside：</div>
      <label>
        <select id="column-break-inside">
          <option value="auto">auto</option>
          <option value="avoid">avoid</option>
        </select>
      </label>
    </div>
    <div style="flex: 1">
      <div>column-break-before：</div>
      <label>
        <select id="column-break-before">
          <option value="auto">auto</option>
          <option value="always">always</option>
          <option value="avoid">avoid</option>
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
      </label>
    </div>
    <div style="flex: 1">
      <label>column-break-after：</label>
      <label>
        <select id="column-break-after">
          <option value="auto">auto</option>
          <option value="always">always</option>
          <option value="avoid">avoid</option>
          <option value="left">left</option>
          <option value="right">right</option>
        </select>
      </label>
    </div>
  </div>
  <hr>
    <div class="column-demo">
      <h3>高溫狀況越來越容易發生！</h3>
      <p>根據美國的氣象資料顯示，今年6月全球平均氣溫、上半年全球均溫、陸溫及海溫都創新高，昨天台灣因西南風沉降作用的關係也熱得發燙，新竹高溫飆上37度，創下當地今夏最高溫紀錄。氣象局預報中心主任鄭明典說，高溫狀況越來越容易發生！</p>
      <img src="/images/20130917rwd.png" alt="">
      <p>台灣溫度趨勢和全球變化一致，氣象局長期預報課李明營表示，上半年台灣均溫比氣候值高出0.68度，今年6月均溫則達29.53度，比平均氣候值高1.95度，是1947年以來最熱的6月。他說台灣今年6月均溫飆高的原因和太平洋副高壓強勁有關，但導致太平洋副高增強主因有待探究。</p>
      <p>昨天中午新竹出現37度高溫，刷新當地今夏最高紀錄，鄭明典表示，當時西南風轉偏南風，中部以北的西半部地區以離岸風為主，海風吹不進來，加上雲量偏低，氣溫便飆高，「近年趨勢是，高溫狀況越來越容易發生！」</p>
      <p class="columnBreak">所幸高溫的情形在今天會有所改善，氣象局預報員張心華表示，隨著華南低壓帶逐漸往東移出，今天水氣和雲量增加，溫度會略降1至2度，但沒下雨的時候，北部有機會達35度左右。</p>
      <p>今天中南部降雨範圍廣，北部及澎湖、金門和馬祖則有局部短暫雨，午後各地有機會出現雷陣雨，且易伴隨瞬間大雨、雷擊、強陣風和溪水暴漲；沿海地區易有9至10級強陣風，西南部及恆春半島沿海易有長浪發生，提醒民眾留意。</p>
      <h3>高溫狀況越來越容易發生！</h3>
      <p>根據美國的氣象資料顯示，今年6月全球平均氣溫、上半年全球均溫、陸溫及海溫都創新高，昨天台灣因西南風沉降作用的關係也熱得發燙，新竹高溫飆上37度，創下當地今夏最高溫紀錄。氣象局預報中心主任鄭明典說，高溫狀況越來越容易發生！</p>
      <img src="/images/20130917rwd.png" alt="">
      <p>台灣溫度趨勢和全球變化一致，氣象局長期預報課李明營表示，上半年台灣均溫比氣候值高出0.68度，今年6月均溫則達29.53度，比平均氣候值高1.95度，是1947年以來最熱的6月。他說台灣今年6月均溫飆高的原因和太平洋副高壓強勁有關，但導致太平洋副高增強主因有待探究。</p>
      <p class="columnBreak">昨天中午新竹出現37度高溫，刷新當地今夏最高紀錄，鄭明典表示，當時西南風轉偏南風，中部以北的西半部地區以離岸風為主，海風吹不進來，加上雲量偏低，氣溫便飆高，「近年趨勢是，高溫狀況越來越容易發生！」</p>
      <p>所幸高溫的情形在今天會有所改善，氣象局預報員張心華表示，隨著華南低壓帶逐漸往東移出，今天水氣和雲量增加，溫度會略降1至2度，但沒下雨的時候，北部有機會達35度左右。</p>
      <p>今天中南部降雨範圍廣，北部及澎湖、金門和馬祖則有局部短暫雨，午後各地有機會出現雷陣雨，且易伴隨瞬間大雨、雷擊、強陣風和溪水暴漲；沿海地區易有9至10級強陣風，西南部及恆春半島沿海易有長浪發生，提醒民眾留意。</p>
    </div>
</div>
{% endraw %}

## 屬性說明

##### column-count

這屬性只要直接填入數值即可，用來定義欄位數量。

##### column-width

`column-count`及`column-width`只能二擇一，前者是直接定義欄位數量，後者則是定義欄位寬度。

##### column-gap

欄位空隙寬度。

##### column-rule-style

欄與欄之間的border樣式。

##### column-rule-width

欄與欄之間的border寬度。

##### column-rule-color

欄與欄之間的border色彩。

##### column-span

設定指定元素不受column影響。*(可以使用在標題或是重要的文字上)*

##### column-break-inside

文字換欄設定

- auto: 自動
- avoid: 文字段落結束後才換欄

##### column-break-before, column-break-after

指定元素的前後是否強制換欄。*可以放在整個段落的前後*

{% raw %}
<script>
$(document).ready(function(){
  var column = 'column-count';
  var columnProps = ['column-count',
                     'column-width',
                     'column-gap',
                     'column-rule-width',
                     'column-rule-style',
                     'column-rule-color',

                    ];
  var h3columnProps = 'column-span';
  var columnBreakInside = 'column-break-inside';
  var breakColumnProps = [
                     '',
                     'column-break-before',
                     'column-break-after'
                    ];
  $.each(columnProps, function(i, prop){
    console.log($('#'+prop));
    $('#'+prop).on('change', function(){
      console.log('a');
      var val = $(this).val();
      $('.column-demo').css(prop, val);
    });
  });
  $.each(breakColumnProps, function(i, prop){
    console.log($('#'+prop));
    $('#'+prop).on('change', function(){
      console.log('a');
      var val = $(this).val();
      $('.columnBreak').css(prop, val);
    });
  });
  $('#'+columnBreakInside).on('change', function(){
    console.log('a');
    var val = $(this).val();
    $('.column-demo p').css(columnBreakInside, val);
  });
  $('#'+h3columnProps).on('change', function(){
    console.log('a');
    var val = $(this).val();
    $('.column-demo h3').css(h3columnProps, val);
  });
});
</script>
{% endraw %}

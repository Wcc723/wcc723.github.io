(function() {
  $(function() {
    var epaAPI, epaData, list, _DefaultContry, _SiteName, _dataItem, _listControl, _listItem, _listItemC, _mainList;

    _DefaultContry = '高雄市';
    _mainList = '#main-list';
    _listItemC = 'listItem';
    _listItem = '.' + _listItemC + '';
    _dataItem = '';
    _listControl = '<tr class="control"><td colspan="2" class="stationSel"><a href="#">測站資訊</a></td><td colspan="2" class="mapSel"><a href="#">地圖顯示</a></td></tr>';
    epaAPI = 'http://opendata.epa.gov.tw/ws/Data/UV/?$orderby=PublishAgency&$skip=0&$top=1000&format=json&callback=?';
    _SiteName = [];
    list = '';
    return epaData = $.getJSON(epaAPI, function() {
      return {
        format: 'json'
      };
    }).done(function(msg) {
      console.log(msg);
      return $.each(msg, function(i, item) {
        if (item.County === _DefaultContry) {
          console.log(item);
          list = '<tr><td>' + item.SiteName + '</td><td>' + item.PublishTime + '</td><td>' + item.TWD97Lon + '</td><td>' + item.UVI + '</td></tr>';
          return $('.itemlist').append(list);
        }
      });
    });
  });

}).call(this);

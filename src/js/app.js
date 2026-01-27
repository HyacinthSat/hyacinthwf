$(function(){
  // 配置：将此处的 wsUrl 改为后端提供的 WebSocket 地址或用 HTTP 接口替代
  const wsUrl = 'ws://localhost:8080/ws';
  let ws = null;

  function log(msg){
    const now = new Date().toLocaleTimeString();
    const el = $('#event-log');
    el.text(now + ' ' + msg + '\n' + el.text());
  }

  function addTelemetryRow(field, value, time){
    const tr = $('<tr>').append($('<td>').text(time), $('<td>').text(field), $('<td>').text(value));
    $('#telemetry-table tbody').prepend(tr);
  }

  function updateCards(data){
    if(data.position !== undefined) $('#pos-value').text(data.position);
    if(data.velocity !== undefined) $('#vel-value').text(data.velocity);
    if(data.power !== undefined) $('#pwr-value').text(data.power);
    if(data.temp !== undefined) $('#temp-value').text(data.temp);
  }

  function handleMessage(msg){
    try{
      const obj = (typeof msg === 'string') ? JSON.parse(msg) : msg;
      const t = obj.time || new Date().toLocaleTimeString();
      if(obj.fields){
        Object.entries(obj.fields).forEach(([k,v]) => addTelemetryRow(k, v, t));
      }
      updateCards(obj);
      log('接收数据');
    }catch(e){
      log('解析消息失败: ' + e.message);
    }
  }

  function connect(){
    if(window.WebSocket){
      ws = new WebSocket(wsUrl);
      ws.onopen = function(){ log('WebSocket 已连接：' + wsUrl); };
      ws.onmessage = function(evt){ handleMessage(evt.data); };
      ws.onclose = function(){ log('WebSocket 已关闭'); };
      ws.onerror = function(){ log('WebSocket 错误'); };
    }else{
      log('浏览器不支持 WebSocket');
    }
  }

  // 自动连接（生产中可改为手动连接/带重连逻辑）
  connect();

  // 调试模拟：如果没有后端，可取消下面注释模拟数据（仅用于本地演示）
  /*
  setInterval(function(){
    const sample = {
      time: new Date().toLocaleTimeString(),
      position: 'N12.345 E123.456',
      velocity: (7.5 + Math.random()).toFixed(2) + ' km/s',
      power: (80 + Math.random()*20).toFixed(1) + ' %',
      temp: (15 + Math.random()*20).toFixed(1) + ' °C',
      fields: { '电压': '3.3V', '电流': (100 + Math.floor(Math.random()*100)) + 'mA' }
    };
    handleMessage(sample);
  }, 3000);
  */

  

  // 页面切换逻辑：根据顶部导航切换页面内容
  function showPage(name){
    $('.page').hide().removeClass('active');
    if(name === '数据'){
      $('#data-page').show().addClass('active');
    }else{
      $('#overview-page').show().addClass('active');
    }
  }

  // 初始化：显示总览并设置第一个导航为激活
  showPage('总览');
  $('.top-nav li').removeClass('active');
  $('.top-nav li').filter(function(){ return $(this).text().trim() === '总览'; }).addClass('active');

  $('.top-nav li').on('click', function(){
    const text = $(this).text().trim();
    $('.top-nav li').removeClass('active');
    $(this).addClass('active');
    showPage(text);
  });

});

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
    // hide all pages first
    $('.page').hide().removeClass('active');

    if(name === '数据'){
      // 显示数据页面
      $('#data-page').show().addClass('active');

      // 隐藏可能存在于 overview 的控件，确保仅展示状态卡
      $('#telemetry, #map, #log, #telemetry-table, #event-log').hide();

      // 只显示 data-page 中的前 8 个 card，隐藏其它（以防未来增减）
      const cards = $('#data-page .cards .card');
      cards.each(function(i){
        if(i < 8) $(this).show(); else $(this).hide();
      });

    }else if(name === '总览'){
      // 显示总览页面并确保遥测/轨迹/日志可见
      $('#overview-page').show().addClass('active');
      $('#telemetry, #map, #log, #telemetry-table, #event-log').show();

    }else if(name === '解码'){
      // 显示解码占位页面（暂无内容），隐藏其他工具控件
      $('#decode-page').show().addClass('active');
      $('#telemetry, #map, #log, #telemetry-table, #event-log').hide();

    }else if(name === '关于'){
      // 显示关于占位页面（暂无内容），隐藏其他工具控件
      $('#about-page').show().addClass('active');
      $('#telemetry, #map, #log, #telemetry-table, #event-log').hide();

    }else{
      // 兜底显示总览
      $('#overview-page').show().addClass('active');
      $('#telemetry, #map, #log, #telemetry-table, #event-log').show();
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

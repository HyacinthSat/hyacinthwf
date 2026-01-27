# 使用说明

简单前端结构，使用 jQuery 作为唯一框架。包含文件：

- `index.html` - 入口页面
- `src/css/style.css` - 基础样式
- `src/js/app.js` - 业务脚本（WebSocket 连接与 DOM 更新）

快速启动（推荐在本地使用静态服务器）：

- 使用 Python 3 的简单服务器：

```bash
python -m http.server 8000
```

然后在浏览器打开：http://localhost:8000/index.html

后端对接提示：

- 默认 `src/js/app.js` 中的 `wsUrl` 为 `ws://localhost:8080/ws`，请根据后端实际地址修改。
- 服务器应发送 JSON，示例格式：

```json
{
  "time": "12:34:56",
  "position": "N12.34 E56.78",
  "velocity": "7.12 km/s",
  "power": "92 %",
  "temp": "23.4 °C",
  "fields": { "电压": "3.3V", "电流": "120mA" }
}
```

- 如果后端不支持 WebSocket，可改为轮询 HTTP 接口并调用页面中的 `handleMessage` 或相应更新函数。

注意：本结构仅为前端基础骨架，实际展示（地图、轨迹、图表）可在此基础上扩展，但仅允许使用 jQuery（不要引入其他前端框架）。

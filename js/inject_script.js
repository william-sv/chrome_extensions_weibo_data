// 获取 weibo相关 数据
var weibo_config = typeof $CONFIG !== "undefined" ? $CONFIG : "未获取到";
window.postMessage({
  "weibo_config": weibo_config
}, '*');
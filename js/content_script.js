// "attitudes_count": 0, // 点赞数
//  "comments_count": 0, // 评论数
//  "reposts_count": 0, // 转发数
// "reads_count": 0, // 阅读数
var weibo_feed_data = {}
document.onreadystatechange = async function () {
  if (document.readyState == 'complete') {

    // 插入数据区域
    floatWrap()

    let weibo_id
    let weibo_uid
    getWeiboConfig().then( async function(val){
      weibo_id = val['page_id']
      weibo_uid = val['uid']
      let page = 1
      while (page <= 30) {
        await getFeedData(page,weibo_id,weibo_uid)
        page +=1
      }
      console.log(weibo_feed_data)
      innerHTMLToPage(weibo_feed_data)
    })

  
  }
    

}

// 创建数据显示区域，并添加相应的动画
function floatWrap(){
  
  const APPElement = document.getElementById('app')
  const floatWrap = document.createElement('div')
  floatWrap.setAttribute('id', 'float-wrap')
  floatWrap.style.position = 'fixed'
  floatWrap.style.top = '100px'
  floatWrap.style.left = '-330px'  // -480px
  floatWrap.style.width = '350px'
  floatWrap.style.minHeight = '800px'
  floatWrap.style.backgroundColor = 'rgba(255,255,255,1)'
  floatWrap.style.zIndex = '1000'
  floatWrap.style.userSelect = 'none'
  floatWrap.style.animationFillMode = 'forwards'
  floatWrap.ondblclick = function(){
    if(floatWrap.style.left == '-330px'){
      floatWrap.style.animation = 'floatWrapKeyFramesRight 1.0s'
      floatWrap.addEventListener('webkitAnimationEnd', function () {
        floatWrap.style.left = '0px'
      })
      // setTimeout("document.getElementById('float-wrap').style.left = '0px'", 1000)
    } else {
      floatWrap.style.animation = 'floatWrapKeyFramesLeft 1.0s'
      floatWrap.addEventListener('webkitAnimationEnd', function () {
        floatWrap.style.left = '-330px'
      })
      //setTimeout("document.getElementById('float-wrap').style.left = '-330px'", 1000)
    }
  }
  APPElement.appendChild(floatWrap)
  const dataTitle = '<div style="margin-top:20px;text-align:center;font-size:16px;color:black;font-weight:bold;">微博数据<button type="button" id="data-btn" style="width:70px;height:25px;margin-left:10px;background-color:#67C23A;color:white;border:none;border-radius:5px;">获取数据</button></div>'
  floatWrap.innerHTML = dataTitle

  document.getElementById('data-btn').onclick = function(){
    handleGetData()
  }

  let documentStyleRules = document.styleSheets[0]
  const floatWrapKeyFramesRight = `
    @keyframes floatWrapKeyFramesRight {
      from {
        left: -330px;
      }
      to {
        left: 0px;
      }
    }
  `
  documentStyleRules.insertRule(floatWrapKeyFramesRight,0)
  const floatWrapKeyFramesLeft = `
    @keyframes floatWrapKeyFramesLeft {
      from {
        left: 0px;
      }
      to {
        left: -330px;
      }
    }
  `
  documentStyleRules.insertRule(floatWrapKeyFramesLeft,0)
}

function handleGetData(){
  console.log('get data~')
}

function getWeiboConfig() {
  return new Promise(resolve => {
    injectCustomJs('js/inject_script.js');
    window.addEventListener('message', function (e) {
      resolve(e.data['weibo_config'] || '未获取到');
    }, false);
  });
}

async function getFeedData(page,weibo_id,weibo_uid){
  const res = await fetch(
    "https://weibo.com/ajax/statuses/mymblog?uid=" + weibo_uid + "&rank=1&page=" + page,
    {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      "referrer": "https://weibo.com/p/" + weibo_id,
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    }
  )
  const result = await res.json()
  if(result.hasOwnProperty('data') && result['data'].hasOwnProperty('list')){
    let feed_list = result['data']['list']
    feed_list.forEach((item) => {
      if(item.hasOwnProperty('visible') && item['visible'].hasOwnProperty('type') && item['visible']['type'] == 0 ){ //visible.type = 0 表示公开 1 表示仅自己可见
        let d = new Date(item['created_at'])
        feed_date = d.getFullYear() + '-' + (d.getMonth() + 1)
        if(!weibo_feed_data.hasOwnProperty(feed_date)){
          weibo_feed_data[feed_date] = {
            "attitudes_count": 0, // 点赞数
            "comments_count": 0, // 评论数
            "reposts_count": 0, // 转发数
            "reads_count": 0, // 阅读数
          }
        }
        weibo_feed_data[feed_date]['attitudes_count'] += item['attitudes_count']
        weibo_feed_data[feed_date]['comments_count'] += item['comments_count']
        weibo_feed_data[feed_date]['reposts_count'] += item['reposts_count']
        weibo_feed_data[feed_date]['reads_count'] += item['reads_count']
      }
    })
  }
  // return result
}

function innerHTMLToPage(data){
  const parentNode = document.getElementsByClassName('WB_frame_b')[0]
  if(parentNode != undefined){
    let element = '<div id="Pl_Core_T8CustomTriColumn__3" anchor="-50"><div class="WB_cardwrap S_bg2"><div class="PCD_counter"><div class="WB_innerwrap"><table class="tb_counter" cellpadding="0" cellspacing="0"><tbody>'
    for (const key in data) {
      element += '<tr><td class="S_line1"><strong class="W_f16" style="font-size:12px;">' + key + '</strong><span class="S_txt2" style="display:inline-block;font-size:12px;margin-bottom:10px">日期</span></td><td class="S_line1"><strong class="W_f16" style="font-size:12px;">' + data[key]['attitudes_count'] + '</strong><span class="S_txt2" style="display:inline-block;font-size:12px;margin-bottom:10px">点赞数</span></td><td class="S_line1"><strong class="W_f16" style="font-size:12px;">' + data[key]['comments_count'] + '</strong><span class="S_txt2" style="display:inline-block;font-size:12px;margin-bottom:10px">评论数</span></td><td class="S_line1"><strong class="W_f16" style="font-size:12px;">' + data[key]['reposts_count'] + '</strong><span class="S_txt2" style="display:inline-block;font-size:12px;margin-bottom:10px">转发数</span></td><td class="S_line1"><strong class="W_f16" style="font-size:12px;">' + data[key]['reads_count'] + '</strong><span class="S_txt2" style="display:inline-block;font-size:12px;margin-bottom:10px">阅读数</span></td></tr>'
    }
    element += '</tbody></table></div></div></div></div>'
    oldElement = parentNode.innerHTML
    parentNode.innerHTML = element + oldElement
  }
  
}

//向页面注入inject_script
function injectCustomJs(jsPath) {
  jsPath = jsPath || 'js/inject_script.js';
  var temp = document.createElement('script');
  temp.setAttribute('type', 'text/javascript');
  temp.src = chrome.extension.getURL(jsPath);
  temp.onload = function () {
    this.parentNode.removeChild(this);
  };
  document.head.appendChild(temp);
}
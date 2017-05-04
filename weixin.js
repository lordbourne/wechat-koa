'use strict';

// 回复机制
// todo: weixin 是个什么对象
exports.reply = function* (next) {
  var message = this.weixin;

  // 对于事件的回复
  if (message.MsgType === 'event') {
    // 订阅
    if (message.Event === 'subscribe') {
      if (!message.EventKey) {
        console.log('扫二维码进来' + message.EventKey + ' ' + message.ticket);
      }
      this.body = '哈哈，你订阅了这个号' + ' 消息 ID: ' + message.MsgId;
    // 取消订阅
    } else if (message.Event === 'unsubscribe') {
      console.log('无情取关');
      this.body = '';
    // 地理位置
    } else if (message.Event === 'LOCATION') {
      this.body = '您上报的位置是：' + message.Latitude + '' + message.Longitude + '-' + message.Precision;
    // 点击菜单
    } else if (message.Event === 'CLICK') {
      this.body = '您点击了菜单：' + message.EventKey;
    // ??
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
      this.body = '看到你扫了一下';
    // ??
    } else if (message.Event === 'VIEW') {
      console.log('关注后扫二维码' + message.EventKey + ' ' + message.Ticket);
      this.body = '您点击了菜单中的链接：' + message.EventKey;
    }
  } else if (message.MsgType === 'text') {
    var content = message.Content;
    var reply = '你说的：' + message.Content + ' 太复杂了';

    // 回复
    if (content === '1') {
      reply = '醋溜白菜';
    } else if (content === '2') {
      reply = '酸辣土豆丝';
    } else if (content === '3') {
      reply = '西红柿疙瘩汤';
    } else if (content === '4') {
      reply = [{
        title: '凉拌土豆丝',
        description: '凉拌土豆丝的做法',
        picUrl: 'http://i1.piimg.com/589268/0956b9fd8eb5a701.png',
        url: 'https://lordbourne.github.io/2017/03/26/%E5%87%89%E6%8B%8C%E5%9C%9F%E8%B1%86%E4%B8%9D/'
      },
      {
        title: '土豆饼',
        description: '土豆饼的做法',
        picUrl: 'http://i4.buimg.com/589268/50c1423ccfdd4f40.jpg',
        url: 'https://lordbourne.github.io/2017/03/26/%E5%9C%9F%E8%B1%86%E9%A5%BC/'
      }];
    }

    this.body = reply;
  }

  yield next;
};

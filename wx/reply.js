'use strict';

var config = require('../config');
var Wechat = require('../wechat/wechat');
var menu = require('./menu');
var wechatApi = new Wechat(config.wechat);
// 回复机制
// todo: weixin 是个什么对象

// wechatApi.deleteMenu().then(function () {
//   return wechatApi.createMenu(menu);
// })
wechatApi.testMenu()
.then(function (msg) {
  console.log(msg);
});

wechatApi.uploadMaterial('a', 'a', 'a')
.then(function (msg) {
  console.log(msg);
});

exports.reply = function* (next) {
  var message = this.weixin;

  // 对于事件的回复, 包括点击菜单会发生的事件
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

    } else if (message.Event === 'scancode_push') {
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = '您点击了菜单中：' + message.EventKey;

    } else if (message.Event === 'scancode_waitmsg') {
      console.log(message.ScanCodeInfo.ScanType);
      console.log(message.ScanCodeInfo.ScanResult);
      this.body = '您点击了菜单中：' + message.EventKey;

    } else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中：' + message.EventKey;

    } else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中：' + message.EventKey;

    } else if (message.Event === 'pic_weixin') {
      console.log(message.SendPicsInfo.PicList);
      console.log(message.SendPicsInfo.Count);
      this.body = '您点击了菜单中：' + message.EventKey;

    } else if (message.Event === 'location_select') {
      console.log(message.SendLocationInfo.Location_X);
      console.log(message.SendLocationInfo.Location_Y);
      console.log(message.SendLocationInfo.Scale);
      console.log(message.SendLocationInfo.Label);
      console.log(message.SendLocationInfo.Poiname);
      this.body = '您点击了菜单中：' + message.EventKey;

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
    } else if (content === '5') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/97cd77aaccebac74.png');
      reply = {
        type: 'image',
        mediaId: data.media_id
      };
      console.log(reply);
    // 视频回复
    } else if (content === '6') {
      var data = yield wechatApi.uploadMaterial('video', __dirname + '/97cd77aaccebac74.png');
      reply = {
        type: 'video',
        title: '一个视频',
        description: '不可描述',
        mediaId: data.media_id
      };
      console.log(reply);
    } else if (content === '7') {
      var data = yield wechatApi.uploadMaterial('image', __dirname + '/un-amico.jpg');
      reply = {
        type: 'music',
        title: 'Un Amico',
        description: '无耻混蛋配乐',
        // musicUrl: './Un-Amico.mp3',
        musicUrl: 'https://y.qq.com/portal/player.html',
        thumbMediaId: data.media_id
      };
      console.log(reply);
    // 分组
    } else if (content === '12') {
      var group = yield wechatApi.createGroup('wechat');
      console.log('新分组 wechat2');
      console.log(group);

      group = yield wechatApi.fetchGroup();
      console.log('加了 wechat2 后的分组列表');
      console.log(group);

      group = yield wechatApi.checkGroup(message.FromUserName);
      console.log('查看自己的分组');
      console.log(group);

      var result = yield wechatApi.moveGroup(message.FromUserName, 100);
      console.log('移动到 100');
      console.log(result);

      group = yield wechatApi.fetchGroup();
      console.log('移动后的分组列表');
      console.log(group);

      result = yield wechatApi.moveGroup([message.FromUserName], 101);
      console.log('移动到 101');
      console.log(result);

      group = yield wechatApi.fetchGroup();
      console.log('批量移动后的分组列表');
      console.log(group);

      result = yield wechatApi.updateGroup(100, 'wechat100');
      console.log('改名了');
      console.log(result);

      group = yield wechatApi.fetchGroup();
      console.log('改名后的分组列表');
      console.log(group);

      result = yield wechatApi.deleteGroup(100);
      console.log('删除了');
      console.log(result);

      group = yield wechatApi.fetchGroup();
      console.log('删除后的分组列表');
      console.log(group);

      reply = 'Group done!';
    } else if (content === '13') {
      var user = yield wechatApi.fetchUsers(message.FromUserName, 'en');
      console.log(user);

      var openIds = [
        {
          openid: message.FromUserName,
          lang: 'en'
        }
      ];
      var users = yield wechatApi.fetchUsers(openIds);
      console.log(users);

      reply = JSON.stringify(user);

    }

    this.body = reply;
  }

  yield next;
};

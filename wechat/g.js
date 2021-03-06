'use strict';
// 中间件，是一个 generator 函数
// 只处理和微信交互的部分，不处理业务逻辑

var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./wechat');
var util = require('./util');

module.exports = function (opts, handler) {// 别忘了这个 handler 参数
  var wechat = new Wechat(opts);

  return function *(next) {
    var that = this;
    console.log(this.query);
    var token = opts.token;

    var signature = this.query.signature;
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;

    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);

    if (this.method === 'GET') {
      if (sha === signature) {
        this.body = echostr + '';
      } else {
        this.body = 'wrong';
      }
    } else if (this.method === 'POST') {
      if (sha !== signature) {
        this.body = 'wrong';
        return false;
      }

      var data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      });
      // console.log(data.toString());
      var content = yield util.parseXMLAsync(data);
      console.log(content);

      var message = util.formatMessage(content.xml);
      console.log(message);

      // if (message.MsgType === 'event') {
      //   if (message.Event === 'subscribe') {
      //     var now = new Date().getTime();
      //     that.status = 200;
      //     that.type = 'application/xml';
      //     that.body = xml;

      //     return;
      //   }
      // }
      //
      this.weixin = message;

      yield handler.call(this, next);

      wechat.reply.call(this);

    }

  };
};

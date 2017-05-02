'use strict';

var Koa = require('koa');
var path = require('path');
var wechat = require('./wechat/g');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');

var config = {
  wechat: {
    appID: 'wxa35db8e13ffe5d16',
    appSecret: '24ba3a5eb9537f322f1b25fe6c244add',
    token: 'weixin',
    getAccessToken: function () {
      return util.readFileAsync(wechat_file);
    },
    saveAccessToken: function (data) {
      data = JSON.stringify(data);
      return util.writeFileAsync(wechat_file, data);
    }

  }
};

var app = new Koa();

app.use(wechat(config.wechat));

var port = '1234';
app.listen(port);
console.log('Listening: ' + port);

'use strict';

// 入口文件

var Koa    = require('koa');
var path   = require('path');
var wechat = require('./wechat/g');// 中间件, 只处理和微信交互的部分，不处理业务逻辑
var util   = require('./libs/util');
var config = require('./config');
var weixin = require('./weixin');
var wechat_file = path.join(__dirname, './config/wechat.txt');

var app = new Koa();

app.use(wechat(config.wechat, weixin.reply));

var port = '1234';
app.listen(port);
console.log('Listening: ' + port);

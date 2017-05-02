var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var prefix = 'https://api.weixin.qq.com/cgi-bin/token';
var api = {
  accessToken: prefix + '?grant_type=client_credential'
};

function Wechat(opts) {
  var that = this;
  // 从外层业务逻辑传入参数
  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  this.getAccessToken()
  .then(function (data) {
    // 是否存在
    try {
      data = JSON.parse(data);
    } catch(e) {
      return that.updateAccessToken(data);
      console.log(e);
    }

    // 有效性检查
    if (that.isValidAccessToken(data)) {
      return Promise.resolve(data);// 别忘了 return
    } else {
      return that.updateAccessToken(data);
    }
  })
  .then(function (data) {
    console.log(data);
    that.access_token = data.access_token;
    that.expires_in = data.expires_in;
    that.saveAccessToken(data);
  });
}

Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false;
  }

  var access_token = data.access_token;
  var expires_in = data.expires_in;
  var now = new Date().getTime();

  if (now < expires_in) {
    return true;
  } else {
    return false;
  }
};

Wechat.prototype.updateAccessToken = function () {
  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

  return new Promise(function (resolve, reject) {
    request({
      url: url,
      json: true
    })
    .then(function (response) {
      var data = response.body;
      var now = (new Date().getTime());
      var expires_in = now + (data.expires_in - 20) * 1000;

      data.expires_in = expires_in;
      resolve(data);
    });
  });
};

module.exports = Wechat;

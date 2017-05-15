'use strict';

var Promise = require('bluebird');
var _       = require('lodash');
var request = Promise.promisify(require('request'));
var util    = require('./util');
var fs      = require('fs');

var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload : prefix + 'media/upload?',
    fetch  : prefix + 'media/get?'
  },
  permanent: {
    upload        : prefix + 'material/add_material?',
    uploadNews    : prefix + 'material/add_news?',
    uploadNewsPic : prefix + 'material/uploadimg?'
  },
  group: {
    create    : prefix + 'groups/create?',
    fetch     : prefix + 'groups/get?',
    check     : prefix + 'groups/getid?',
    update    : prefix + 'groups/update?',
    move      : prefix + 'groups/members/update?',
    batchmove : prefix + 'groups/members/batchupdate?',
    delete    : prefix + 'groups/delete?',
  },
  user: {
    remark     : prefix + 'user/info/updateremark?',
    fetch      : prefix + 'user/info?',
    batchFetch : prefix + 'user/user/info/batchget?',
  },
  menu: {
    create  : prefix + "menu/create?",
    get     : prefix + "menu/get?",
    delete  : prefix + "menu/delete?",
    current : prefix + "get_current_selfmenu_info?",
  }
};


function Wechat(opts) {
  var that = this;

  this.appID = opts.appID;
  this.appSecret = opts.appSecret;
  this.getAccessToken = opts.getAccessToken;
  this.saveAccessToken = opts.saveAccessToken;

  // 从本地读取 access_token
  // 如果没读到，则重新获取
  // 继续检验是否有效，无效的话就重新获取
  // 打印并写入文件保存
  this.getAccessToken()
  .then(function (data) {
    try {
      data = JSON.parse(data);
    } catch(e) {
      return that.updateAccessToken(data);
      console.log(e);
    }
    if (that.isValidAccessToken(data)) {
      return Promise.resolve(data);// ?????return
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

/* ---------- 票据管理---------- */
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

Wechat.prototype.fetchAccessToken = function (data) {
  var that = this;
  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this);
    }
  }

  this.getAccessToken()
  .then(function (data) {

    try {
      data = JSON.parse(data);
    } catch(e) {
      return that.updateAccessToken(data);
      console.log(e);
    }


    if (that.isValidAccessToken(data)) {
      return Promise.resolve(data);
    } else {
      return that.updateAccessToken(data);
    }
  })
  .then(function (data) {
    console.log(data);
    that.access_token = data.access_token;
    that.expires_in = data.expires_in;
    that.saveAccessToken(data);

    return Promise.resolve(data);
  });
};

/* ---------- 回复 ---------- */
Wechat.prototype.reply = function () {
  var content = this.body;
  var message = this.weixin;
  var xml = util.tpl(content, message);

  this.status = 200;
  this.type = 'application/xml';
  this.body = xml;
};

/* ---------- 素材---------- */
Wechat.prototype.uploadMaterial = function (mediaId, type, permanent) {
  var that = this;
  var form = {};
  var fetchUrl = api.temporary.fetch;

  if (permanent) {
    fetchUrl = api.permanent.fetch;
  }

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = fetchUrl + 'access_token=' + data.access_token + '&media_id' + mediaId;

          if (!permanent && type === 'video') {
            // url += url.replace('https://', 'http://')
          }
          resolve(url);

      });

  });
};
Wechat.prototype.fetchMaterial = function (type, material, permanent) {
  var that = this;
  var form = {};
  var uploadUrl = api.temporary.upload;

  if (permanent) {
    uploadUrl = api.permanent.upload;
    _.extend(form, permanent);
  }
  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic;
  }
  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews;
    form = material;
  } else {
    form.media = fs.createReadStream(material);
  }

  var appID = this.appID;
  var appSecret = this.appSecret;
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = uploadUrl + 'access_token=' + data.access_token;
          if (!permanent) {
            url += '&type=' + type;
          } else {
            form.access_token = data.access_token;
          }
          var options = {
            method: 'POST',
            url: url,
            json: true
          };
          if (type === 'news') {
            options.body = form;
          } else {
            options.formData = form;
          }
          request({
            method: 'POST',
            url: url,
            formData: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;

            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Upload material fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });

  });
};

/* ---------- 分组---------- */
Wechat.prototype.createGroup = function (name) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.group.create + 'access_token=' + data.access_token;
          var form = {
            group: {
              name: name
            }
          };

          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Create group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.fetchGroup = function () {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.group.fetch + 'access_token=' + data.access_token;

          request({
            url: url,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Fetch group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.checkGroup = function (openId) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.group.check + 'access_token=' + data.access_token;
          var form = {
            openid: openId
          };

          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Check group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.updateGroup = function (id, name) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.group.update + 'access_token=' + data.access_token;
          var form = {
            group: {
              id: id,
              name: name
            }
          };

          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Update group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.moveGroup = function (openIds, to) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url;
          var form = {
            to_groupid: to
          };
          if (_.isArray(openIds)) {
            url = api.group.batchmove + 'access_token=' + data.access_token;
            form.openid_list = openIds;
          } else {
            url = api.group.move + 'access_token=' + data.access_token;
            form.openid = openIds;
          }
          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Batch move group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.deleteGroup = function (id) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.group.delete + 'access_token=' + data.access_token;
          var form = {
            group: {
              id: id
            }
          };

          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Delete group fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

/* ---------- 用户管理---------- */
Wechat.prototype.remarkUser = function (openId, remark) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.user.remark + 'access_token=' + data.access_token;
          var form = {
            openid: openId,
            remark: remark
          };

          request({
            method: 'POST',
            url: url,
            body: form,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Remark user fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.fetchUsers = function (openIds, lang) {
  var that = this;

  lang = lang || 'zh-CN';

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var options = {
            method: 'GET',
            json: true
          };
          if (_.isArray(openIds)) {
            options.url = api.user.batchFetch + 'access_token=' + data.access_token;
            options.body = {
              user_list: openIds
            };
            options.method = 'POST';
          } else {
            options.url = api.user.fetch
              + 'access_token=' + data.access_token
              + '&openid=' + openIds
              + '&lang=' + lang;
          }

          request(options)
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Batchfetch users fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};

/* ---------- 菜单管理 ---------- */
Wechat.prototype.testMenu = function (menu) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          console.log(1123);
          resolve(data);
      });
  });
};

Wechat.prototype.createMenu = function (menu) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          // var url = api.menu.create + 'access_token=' + data.access_token;
          // var form = menu;

          // request({
          //   method: 'POST',
          //   url: url,
          //   body: form,
          //   json: true
          // })
          // .then(function (response) {
          //   var _data = response.body;
          //   if (_data) {
          //     resolve(_data);
          //   } else {
          //     throw new Error('Create Menu fails');
          //   }
          // })
          // .catch(function (err) {
          //   reject(err);
          // });
          console.log(1123);
      });
  });
};
Wechat.prototype.getMenu = function (menu) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.menu.get + 'access_token=' + data.access_token;

          request({
            url: url,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Get Menu fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.deleteMenu = function (menu) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.menu.delete + 'access_token=' + data.access_token;

          request({
            url: url,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Delete Menu fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};
Wechat.prototype.getCurrentMenu = function (menu) {
  var that = this;

  return new Promise(function (resolve, reject) {
    that
      .fetchAccessToken()
      .then(function (data) {
          var url = api.menu.current + 'access_token=' + data.access_token;

          request({
            url: url,
            json: true
          })
          .then(function (response) {
            var _data = response.body;
            if (_data) {
              resolve(_data);
            } else {
              throw new Error('Get current menu fails');
            }
          })
          .catch(function (err) {
            reject(err);
          });
      });
  });
};









module.exports = Wechat;

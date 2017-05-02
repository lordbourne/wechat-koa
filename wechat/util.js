'use strict';

var xml2js = require('xml2js');
var Promise = require('bluebird');

exports.parseXMLAsync = function (xml) {
  return new Promise(function (resolve, reject) {
    xml2js.parseString(xml, {trim: true}, function (err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
};

function formatMessage(result) {
  var message = {};
  if (typeof result === 'object') {
    // var keys = Object.keys(result);
    var item = null;
    for (var key in result) {
      item = result[key];
      if (!(item instanceof Array) || item.length === 0) {
        continue;
      }
      if (item.length === 1) {
        var val = item[0];
        if (typeof val === 'object') {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || '').trim();
        }
      } else {
        message[key] = [];
        for (var i = 0; i < item.length; i++) {
          message[key].push(formatMessage(item[i]));
        }
      }
    }
  }
  return message;
}
exports.formatMessage = formatMessage;

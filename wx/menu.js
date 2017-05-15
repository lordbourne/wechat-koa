'use strict';

module.exports = {
  'burron': [
    {
      'name': '点击事件',
      'type': 'click',
      'key': 'menu_click'
    },
    {
      'name': '点击菜单',
      'sub_button': [
        {
          'name': '跳转 URL',
          'type': 'view',
          'url': 'http://github.com/'
        },
        {
          'name': '扫码推送事件',
          'type': 'scancode_push',
          'url': 'qr_scan'
        },
        {
          'name': '扫码推送中',
          'type': 'scancode_waitmsg',
          'url': 'qr_scan_wait'
        },
        {
          'name': '弹出系统拍照',
          'type': 'pic_sysphoto',
          'url': 'pic_photo'
        },
        {
          'name': '弹出拍照或菜单',
          'type': 'pic_photo_or_album',
          'url': 'pic_photo_album'
        },
      ]
    },
    {
      'name': '点击菜单2',
      'sub_button': [
        {
          'name': '微信相册发图',
          'type': 'pic_weixin',
          'key': 'pic_weixin'
        },
        {
          'name': '地理位置选择',
          'type': 'location_select',
          'key': 'location_select'
        }
      ]
    }
  ]
};

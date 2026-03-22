// cloudfunctions/getOpenId/index.js
const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 获取用户 OpenId 云函数
 * @description 返回当前用户的 openid 和 appid
 */
exports.main = async (event, context) => {
  // 从云函数上下文获取用户信息
  const wxContext = cloud.getWXContext();
  
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    success: true
  };
};

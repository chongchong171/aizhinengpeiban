// 云函数：更新成员自定义称呼
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { memberId, customTitle } = event;
    
    if (!memberId) {
      return {
        success: false,
        message: '成员 ID 不能为空'
      };
    }
    
    // 获取成员信息
    const member = await db.collection('members').doc(memberId).get();
    
    if (!member.data) {
      return {
        success: false,
        message: '成员不存在'
      };
    }
    
    // 验证是否是本人
    if (member.data.userId !== OPENID) {
      return {
        success: false,
        message: '只能修改自己的称呼'
      };
    }
    
    // 更新自定义称呼
    await db.collection('members').doc(memberId).update({
      data: {
        customTitle: customTitle || ''
      }
    });
    
    return {
      success: true,
      message: '称呼更新成功'
    };
    
  } catch (error) {
    console.error('更新称呼失败:', error);
    return {
      success: false,
      message: '更新失败：' + error.message
    };
  }
};

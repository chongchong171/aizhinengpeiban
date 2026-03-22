// 云函数：更新舍友心情
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { memberId, mood, moodEmoji } = event;
    
    if (!memberId || !mood || !moodEmoji) {
      return {
        success: false,
        message: '参数不完整'
      };
    }
    
    // 验证是否是本人
    const member = await db.collection('members').doc(memberId).get();
    
    if (!member.data || member.data.userId !== OPENID) {
      return {
        success: false,
        message: '只能设置自己的心情哦~'
      };
    }
    
    // 更新心情
    const now = Date.now();
    await db.collection('members').doc(memberId).update({
      data: {
        mood: mood,
        moodEmoji: moodEmoji,
        moodTime: now,
        lastActiveDate: now
      }
    });
    
    return {
      success: true,
      message: '心情更新成功'
    };
    
  } catch (error) {
    console.error('更新心情失败:', error);
    return {
      success: false,
      message: '更新失败：' + error.message
    };
  }
};

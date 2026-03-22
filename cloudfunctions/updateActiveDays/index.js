// 云函数：更新活跃天数
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { dormitoryId } = event;
    
    if (!dormitoryId) {
      // 获取用户所在的宿舍
      const memberResult = await db.collection('members').where({
        userId: OPENID
      }).get();
      
      if (memberResult.data.length === 0) {
        return {
          success: false,
          message: '您还未加入宿舍'
        };
      }
      
      event.dormitoryId = memberResult.data[0].dormitoryId;
    }
    
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    
    // 更新成员活跃天数
    const memberResult = await db.collection('members').where({
      dormitoryId: event.dormitoryId,
      userId: OPENID
    }).get();
    
    if (memberResult.data.length > 0) {
      const member = memberResult.data[0];
      const lastActive = member.lastActiveDate || 0;
      const lastActiveDay = new Date(lastActive).setHours(0, 0, 0, 0);
      
      // 如果今天还没有活跃过
      if (today > lastActiveDay) {
        await db.collection('members').doc(member._id).update({
          data: {
            activeDays: db.command.inc(1),
            lastActiveDate: now
          }
        });
      } else {
        // 更新最后活跃时间
        await db.collection('members').doc(member._id).update({
          data: {
            lastActiveDate: now
          }
        });
      }
    }
    
    // 更新宿舍活跃天数
    const dormitory = await db.collection('dormitories').doc(event.dormitoryId).get();
    
    if (dormitory.data) {
      const dormLastActive = dormitory.data.lastActiveDate || 0;
      const dormLastActiveDay = new Date(dormLastActive).setHours(0, 0, 0, 0);
      
      if (today > dormLastActiveDay) {
        await db.collection('dormitories').doc(event.dormitoryId).update({
          data: {
            activeDays: db.command.inc(1),
            lastActiveDate: now
          }
        });
      } else {
        await db.collection('dormitories').doc(event.dormitoryId).update({
          data: {
            lastActiveDate: now
          }
        });
      }
    }
    
    return {
      success: true,
      message: '活跃天数已更新'
    };
    
  } catch (error) {
    console.error('更新活跃天数失败:', error);
    return {
      success: false,
      message: '更新失败：' + error.message
    };
  }
};

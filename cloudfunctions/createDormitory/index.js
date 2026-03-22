// 云函数：创建宿舍
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { 
      dormName, 
      style, 
      capacity, 
      ageGroup, 
      description,
      agreement 
    } = event;
    
    // 验证必填项
    if (!dormName || !style || !capacity || !ageGroup) {
      return {
        success: false,
        message: '请填写完整信息'
      };
    }
    
    // 检查用户是否已加入宿舍
    const existingMember = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    if (existingMember.data.length > 0) {
      return {
        success: false,
        message: '您已经加入了一个宿舍'
      };
    }
    
    // 创建宿舍
    const now = Date.now();
    const dormitoryResult = await db.collection('dormitories').add({
      data: {
        name: dormName,
        style: style,
        creator: OPENID,
        createdAt: now,
        memberCount: 1,
        capacity: parseInt(capacity),
        ageGroup: ageGroup,
        introduction: description || '',
        agreement: agreement || '',
        activeDays: 1,
        level: 1,
        exp: 0,
        lastActiveDate: now
      }
    });
    
    // 创建宿舍成员记录（创建者自动成为大当家）
    await db.collection('members').add({
      data: {
        dormitoryId: dormitoryResult._id,
        userId: OPENID,
        nickname: event.nickname || '舍友',
        title: '大当家',
        customTitle: '',
        joinedAt: now,
        activeDays: 1,
        moodCount: 0,
        goodnightCount: 0,
        lastActiveDate: now
      }
    });
    
    return {
      success: true,
      dormitoryId: dormitoryResult._id,
      message: '宿舍创建成功'
    };
    
  } catch (error) {
    console.error('创建宿舍失败:', error);
    return {
      success: false,
      message: '创建失败：' + error.message
    };
  }
};

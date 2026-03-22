// 云函数：获取宿舍首页数据
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
      
      return {
        success: true,
        dormitoryId: memberResult.data[0].dormitoryId,
        memberInfo: memberResult.data[0]
      };
    }
    
    // 获取宿舍信息
    const dormitory = await db.collection('dormitories').doc(dormitoryId).get();
    
    if (!dormitory.data) {
      return {
        success: false,
        message: '宿舍不存在'
      };
    }
    
    // 获取当前用户的成员信息
    const memberResult = await db.collection('members').where({
      dormitoryId: dormitoryId,
      userId: OPENID
    }).get();
    
    let memberInfo = null;
    if (memberResult.data.length > 0) {
      memberInfo = memberResult.data[0];
    }
    
    // 获取所有成员
    const members = await db.collection('members').where({
      dormitoryId: dormitoryId
    }).orderBy('joinedAt', 'asc').get();
    
    // 计算活跃天数
    const now = Date.now();
    const createdAt = dormitory.data.createdAt;
    const activeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)) + 1;
    
    // 计算纪念日信息
    const anniversaryInfo = calculateAnniversary(createdAt, now);
    
    // 获取在线成员（简化：最近 24 小时活跃的）
    const onlineMembers = members.data.filter(m => {
      return (now - (m.lastActiveDate || 0)) < 24 * 60 * 60 * 1000;
    });
    
    // 构建所有舍友信息（包含心情）
    const allMembers = members.data.map(m => {
      const isOnline = (now - (m.lastActiveDate || 0)) < 24 * 60 * 60 * 1000;
      return {
        id: m._id,
        name: m.nickname,
        title: m.title,
        customTitle: m.customTitle,
        avatar: '/images/avatar-default.png', // TODO: 实际头像
        isOnline: isOnline,
        mood: m.mood || null,
        moodEmoji: m.moodEmoji || null,
        moodTime: m.moodTime || null
      };
    });
    
    return {
      success: true,
      dormitory: {
        ...dormitory.data,
        activeDays: activeDays,
        anniversaryInfo: anniversaryInfo
      },
      memberInfo: memberInfo,
      allMembers: allMembers,
      recentPosts: [],
      todayTasks: []
    };
    
  } catch (error) {
    console.error('获取宿舍数据失败:', error);
    return {
      success: false,
      message: '加载失败：' + error.message
    };
  }
};

// 计算纪念日信息
function calculateAnniversary(createdAt, now) {
  const days = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  
  let milestone = null;
  let message = '';
  
  if (days === 0) {
    milestone = 'today';
    message = '今天是宿舍成立日！🎉';
  } else if (days === 7) {
    milestone = 'week';
    message = '宿舍成立 7 天啦！🎊';
  } else if (days === 30) {
    milestone = 'month';
    message = '宿舍成立满月啦！🌙';
  } else if (days === 100) {
    milestone = 'hundred';
    message = '宿舍成立 100 天！💯';
  } else if (days === 365) {
    milestone = 'year';
    message = '宿舍成立一周年！🎂';
  }
  
  return {
    days: days,
    milestone: milestone,
    message: message,
    createdAt: createdAt
  };
}

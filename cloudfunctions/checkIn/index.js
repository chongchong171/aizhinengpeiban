// 云函数：签到功能
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
    // 获取用户信息
    const userResult = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    // 检查今天是否已签到
    const existingCheckin = await db.collection('checkInRecords').where({
      userId: OPENID,
      checkInDate: _.gte(todayStart).and(_.lt(todayStart + 24 * 60 * 60 * 1000))
    }).get();
    
    if (existingCheckin.data.length > 0) {
      return {
        success: false,
        message: '今天已经签到过了哦~'
      };
    }
    
    // 计算连续签到天数
    let consecutiveDays = user.consecutiveDays || 0;
    const lastCheckInDate = user.lastCheckinDate || 0;
    
    // 如果上次签到是昨天，则连续天数 +1，否则重置为 1
    const yesterday = new Date(todayStart - 24 * 60 * 60 * 1000);
    if (lastCheckInDate >= yesterday.getTime() && lastCheckInDate < todayStart) {
      consecutiveDays += 1;
    } else if (lastCheckInDate < yesterday.getTime()) {
      consecutiveDays = 1;
    } else {
      consecutiveDays = 1;
    }
    
    // 计算奖励：基础 10 星光值，连续 7 天以上 +20 星光值
    let rewardStarlight = 10;
    let bonusType = 'base';
    
    if (consecutiveDays >= 7) {
      rewardStarlight = 20;
      bonusType = 'consecutive_7';
    } else if (consecutiveDays >= 3) {
      rewardStarlight = 15;
      bonusType = 'consecutive_3';
    }
    
    // 开启事务
    const transaction = await db.startTransaction();
    
    try {
      // 1. 创建签到记录
      await transaction.collection('checkInRecords').add({
        data: {
          userId: OPENID,
          dormitoryId: user.dormitoryId,
          checkInDate: now,
          rewardStarlight: rewardStarlight,
          consecutiveDays: consecutiveDays,
          bonusType: bonusType
        }
      });
      
      // 2. 更新用户信息
      await transaction.collection('members').doc(user._id).update({
        data: {
          starlightPoints: _.inc(rewardStarlight),
          totalStarlight: _.inc(rewardStarlight),
          personalExp: _.inc(rewardStarlight),
          consecutiveDays: consecutiveDays,
          lastCheckinDate: todayStart
        }
      });
      
      await transaction.commit();
      
      // 3. 检查成就解锁
      const achievements = await checkAchievements(OPENID, consecutiveDays);
      
      // 计算新等级（每 100 经验升 1 级）
      const newExp = (user.personalExp || 0) + rewardStarlight;
      const newLevel = Math.floor(newExp / 100) + 1;
      
      // 记录日志
      console.log(`用户 ${OPENID} 签到成功，连续 ${consecutiveDays} 天，获得 ${rewardStarlight} 星光值`);
      
      return {
        success: true,
        message: `签到成功！获得 ${rewardStarlight} 星光值 🌟 连续签到 ${consecutiveDays} 天`,
        data: {
          rewardStarlight: rewardStarlight,
          consecutiveDays: consecutiveDays,
          bonusType: bonusType,
          newStarlight: (user.starlightPoints || 0) + rewardStarlight,
          newLevel: newLevel,
          achievements: achievements
        }
      };
      
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    console.error('签到失败:', error);
    return {
      success: false,
      message: '签到失败：' + error.message
    };
  }
};

// 检查成就解锁
async function checkAchievements(userId, consecutiveDays) {
  const achievements = [];
  
  try {
    const userResult = await db.collection('members').where({
      userId: userId
    }).field({ achievements: true })
    .get();
    
    if (userResult.data.length === 0) {
      return achievements;
    }
    
    const user = userResult.data[0];
    const userAchievements = user.achievements || [];
    const achievementIds = userAchievements.map(a => a.id);
    
    // 连续签到成就配置
    const checkInAchievements = [
      { id: 'checkin_7', name: '初入茅庐', description: '连续签到 7 天', requirement: 7, reward: 50 },
      { id: 'checkin_30', name: '持之以恒', description: '连续签到 30 天', requirement: 30, reward: 200 },
      { id: 'checkin_100', name: '铁杆粉丝', description: '连续签到 100 天', requirement: 100, reward: 500 },
      { id: 'checkin_365', name: '一年之约', description: '连续签到 365 天', requirement: 365, reward: 2000 }
    ];
    
    for (const achievement of checkInAchievements) {
      if (consecutiveDays >= achievement.requirement && !achievementIds.includes(achievement.id)) {
        // 解锁成就
        achievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward,
          unlockedAt: Date.now()
        });
        
        // 添加到用户成就列表
        userAchievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward,
          unlockedAt: Date.now()
        });
        
        // 发放成就奖励
        await db.collection('members').doc(user._id).update({
          data: {
            achievements: userAchievements,
            starlightPoints: _.inc(achievement.reward),
            totalStarlight: _.inc(achievement.reward)
          }
        });
        
        console.log(`用户 ${userId} 解锁成就：${achievement.name}`);
      }
    }
    
  } catch (error) {
    console.error('检查成就失败:', error);
  }
  
  return achievements;
}

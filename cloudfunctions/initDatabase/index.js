/**
 * 数据库初始化脚本 - 商业化功能
 * @description 创建 couponRedemptions 集合和更新 members 集合结构
 * @usage 在微信开发者工具云开发控制台中执行
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 主函数：初始化数据库
async function initDatabase() {
  console.log('开始初始化商业化功能数据库...');
  
  try {
    // 1. 创建 couponRedemptions 集合
    console.log('创建 couponRedemptions 集合...');
    await db.createCollection('couponRedemptions');
    console.log('✓ couponRedemptions 集合创建成功');
    
    // 2. 为 members 集合添加索引（如果不存在）
    console.log('为 members 集合添加索引...');
    
    // 为 userId 添加索引
    try {
      await db.collection('members').createIndex('userId');
      console.log('✓ members.userId 索引创建成功');
    } catch (e) {
      console.log('members.userId 索引已存在');
    }
    
    // 为 dormitoryId 添加索引
    try {
      await db.collection('members').createIndex('dormitoryId');
      console.log('✓ members.dormitoryId 索引创建成功');
    } catch (e) {
      console.log('members.dormitoryId 索引已存在');
    }
    
    // 3. 为 couponRedemptions 集合添加索引
    console.log('为 couponRedemptions 集合添加索引...');
    
    try {
      await db.collection('couponRedemptions').createIndex('userId');
      console.log('✓ couponRedemptions.userId 索引创建成功');
    } catch (e) {
      console.log('couponRedemptions.userId 索引已存在');
    }
    
    try {
      await db.collection('couponRedemptions').createIndex('status');
      console.log('✓ couponRedemptions.status 索引创建成功');
    } catch (e) {
      console.log('couponRedemptions.status 索引已存在');
    }
    
    try {
      await db.collection('couponRedemptions').createIndex('expireAt');
      console.log('✓ couponRedemptions.expireAt 索引创建成功');
    } catch (e) {
      console.log('couponRedemptions.expireAt 索引已存在');
    }
    
    // 4. 为 taskRecords 集合添加索引（如果不存在）
    try {
      await db.createCollection('taskRecords');
      console.log('✓ taskRecords 集合创建成功');
    } catch (e) {
      console.log('taskRecords 集合已存在');
    }
    
    try {
      await db.collection('taskRecords').createIndex('userId');
      console.log('✓ taskRecords.userId 索引创建成功');
    } catch (e) {
      console.log('taskRecords.userId 索引已存在');
    }
    
    console.log('\n✅ 数据库初始化完成！');
    console.log('\n集合列表：');
    console.log('- members: 成员信息（已添加积分字段）');
    console.log('- couponRedemptions: 优惠券兑换记录（新建）');
    console.log('- taskRecords: 任务完成记录（新建）');
    
    return {
      success: true,
      message: '数据库初始化成功'
    };
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      message: '初始化失败：' + error.message
    };
  }
}

// 更新现有 members 记录的积分字段
async function updateMembersFields() {
  console.log('更新现有 members 记录的积分字段...');
  
  try {
    const members = await db.collection('members').get();
    
    let updatedCount = 0;
    
    for (const member of members.data) {
      // 检查是否已有积分字段
      if (!member.starlightPoints) {
        await db.collection('members').doc(member._id).update({
          data: {
            starlightPoints: 0,
            crystalDiamonds: 0,
            totalStarlight: 0,
            totalCrystal: 0,
            personalExp: 0,
            level: 1
          }
        });
        updatedCount++;
      }
    }
    
    console.log(`✓ 更新了 ${updatedCount} 条成员记录`);
    
    return {
      success: true,
      updatedCount: updatedCount
    };
    
  } catch (error) {
    console.error('更新 members 字段失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 云函数入口点
exports.main = async (event, context) => {
  console.log('initDatabase 云函数被调用', event);
  
  try {
    const action = event.action || 'init';
    
    if (action === 'init') {
      return await initDatabase();
    } else if (action === 'update') {
      return await updateMembersFields();
    } else {
      return {
        success: false,
        message: '未知操作：' + action
      };
    }
    
  } catch (error) {
    console.error('initDatabase 执行失败:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

// 导出函数
module.exports = {
  initDatabase,
  updateMembersFields
};

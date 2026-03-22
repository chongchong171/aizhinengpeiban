/**
 * 数据库初始化脚本 - 女生宿舍商业化
 * 
 * 用途：初始化积分系统所需的数据库集合和索引
 * 执行方式：在微信开发者工具云开发控制台运行
 * 
 * @author 玄枢
 * @date 2026-03-17
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

async function initCommercialDB() {
  console.log('=== 开始初始化商业化数据库 ===');
  
  try {
    // 1. 更新 members 集合结构（添加积分字段）
    console.log('\n1. 检查 members 集合结构...');
    await checkMembersCollection();
    
    // 2. 创建 couponRedemptions 集合
    console.log('\n2. 创建 couponRedemptions 集合...');
    await createCouponRedemptionsCollection();
    
    // 3. 创建 taskRecords 集合
    console.log('\n3. 创建 taskRecords 集合...');
    await createTaskRecordsCollection();
    
    console.log('\n=== 数据库初始化完成 ===');
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

/**
 * 检查 members 集合结构
 * 注意：云函数中无法直接修改集合结构，这里只做检查
 * 实际字段添加需要在小程序端或云开发控制台手动添加
 */
async function checkMembersCollection() {
  try {
    const members = db.collection('members');
    
    // 检查集合是否存在
    const testQuery = await members.limit(1).get();
    console.log('✓ members 集合已存在');
    
    // 提示需要手动添加的字段
    console.log('\n⚠️  请确保 members 集合包含以下字段：');
    console.log('   - starlightPoints: Number（当前星光值，默认 0）');
    console.log('   - crystalDiamonds: Number（当前晶钻，默认 0）');
    console.log('   - totalStarlight: Number（累计星光值，默认 0）');
    console.log('   - totalCrystal: Number（累计晶钻，默认 0）');
    console.log('\n💡  操作方式：');
    console.log('   1. 打开微信开发者工具 - 云开发 - 数据库');
    console.log('   2. 选择 members 集合');
    console.log('   3. 点击"添加字段"，依次添加上述字段，类型选择 Number');
    console.log('   4. 设置默认值为 0');
    
    return true;
  } catch (error) {
    if (error.errCode === -502001) {
      console.log('✗ members 集合不存在，请先创建该集合');
    } else {
      console.log('✓ members 集合已存在');
    }
    return false;
  }
}

/**
 * 创建 couponRedemptions 集合（优惠券兑换记录）
 */
async function createCouponRedemptionsCollection() {
  try {
    // 尝试创建集合
    await db.createCollection('couponRedemptions');
    console.log('✓ couponRedemptions 集合创建成功');
    
    // 创建索引
    const collection = db.collection('couponRedemptions');
    
    // 创建复合索引：userId + status
    try {
      await collection.createIndex('userId_status', {
        userId: 1,
        status: 1
      });
      console.log('✓ 索引 userId_status 创建成功');
    } catch (e) {
      console.log('⚠️  索引 userId_status 可能已存在');
    }
    
    // 创建复合索引：userId + expireAt
    try {
      await collection.createIndex('userId_expireAt', {
        userId: 1,
        expireAt: 1
      });
      console.log('✓ 索引 userId_expireAt 创建成功');
    } catch (e) {
      console.log('⚠️  索引 userId_expireAt 可能已存在');
    }
    
    // 创建索引：createdAt（降序）
    try {
      await collection.createIndex('createdAt', {
        createdAt: -1
      });
      console.log('✓ 索引 createdAt 创建成功');
    } catch (e) {
      console.log('⚠️  索引 createdAt 可能已存在');
    }
    
    console.log('\n📋 couponRedemptions 集合字段说明：');
    console.log('   - userId: String（用户 openid）');
    console.log('   - dormitoryId: String（宿舍 ID）');
    console.log('   - couponType: String（优惠券类型）');
    console.log('   - couponValue: Number（优惠券面额）');
    console.log('   - minPurchase: Number（使用门槛）');
    console.log('   - pointsType: String（积分类型：starlight | crystal）');
    console.log('   - pointsCost: Number（花费积分数量）');
    console.log('   - status: String（状态：unused | used | expired）');
    console.log('   - expireAt: Number（过期时间戳）');
    console.log('   - usedAt: Number（使用时间戳，可选）');
    console.log('   - createdAt: Number（创建时间戳）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  couponRedemptions 集合已存在');
      return true;
    }
    throw error;
  }
}

/**
 * 创建 taskRecords 集合（任务完成记录）
 */
async function createTaskRecordsCollection() {
  try {
    // 尝试创建集合
    await db.createCollection('taskRecords');
    console.log('✓ taskRecords 集合创建成功');
    
    // 创建索引
    const collection = db.collection('taskRecords');
    
    // 创建复合索引：userId + taskType
    try {
      await collection.createIndex('userId_taskType', {
        userId: 1,
        taskType: 1
      });
      console.log('✓ 索引 userId_taskType 创建成功');
    } catch (e) {
      console.log('⚠️  索引 userId_taskType 可能已存在');
    }
    
    // 创建索引：completedAt（降序）
    try {
      await collection.createIndex('completedAt', {
        completedAt: -1
      });
      console.log('✓ 索引 completedAt 创建成功');
    } catch (e) {
      console.log('⚠️  索引 completedAt 可能已存在');
    }
    
    console.log('\n📋 taskRecords 集合字段说明：');
    console.log('   - userId: String（用户 openid）');
    console.log('   - taskId: String（任务 ID）');
    console.log('   - taskType: String（任务类型：daily | weekly | achievement）');
    console.log('   - rewardType: String（奖励类型：starlight | crystal | exp）');
    console.log('   - rewardAmount: Number（奖励数量）');
    console.log('   - completedAt: Number（完成时间戳）');
    console.log('   - claimed: Boolean（是否已领取奖励）');
    console.log('   - claimedAt: Number（领取时间戳）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  taskRecords 集合已存在');
      return true;
    }
    throw error;
  }
}

// 导出主函数
exports.main = async (event, context) => {
  return await initCommercialDB();
};

// 如果直接运行此文件（本地调试）
if (require.main === module) {
  initCommercialDB().then(result => {
    console.log('\n初始化结果:', result);
  }).catch(error => {
    console.error('\n初始化失败:', error);
  });
}

module.exports = { initCommercialDB };

// 云函数：兑换优惠券（事务处理，原子操作）
// 功能：验证参数、检查积分、防刷验证、事务处理、积分扣减、创建优惠券、记录流水
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
    // 1. 验证参数完整性
    const { couponType, dormitoryId, pointsType } = event;
    
    if (!couponType) {
      return {
        success: false,
        message: '请选择要兑换的优惠券'
      };
    }
    
    if (!pointsType || (pointsType !== 'starlight' && pointsType !== 'crystal')) {
      return {
        success: false,
        message: '积分类型参数错误'
      };
    }
    
    // 2. 获取优惠券配置
    const couponConfig = getCouponConfig(couponType);
    if (!couponConfig) {
      return {
        success: false,
        message: '优惠券配置不存在'
      };
    }
    
    // 3. 获取用户信息（积分余额）
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
    const userDormitoryId = user.dormitoryId || dormitoryId;
    const pointsField = pointsType === 'starlight' ? 'starlightPoints' : 'crystalDiamonds';
    const currentPoints = user[pointsField] || 0;
    
    // 4. 检查本月已兑换数量（防刷机制）
    const now = Date.now();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const redeemedCountResult = await db.collection('couponRedemptions').where({
      userId: OPENID,
      createdAt: _.gte(startOfMonth.getTime()),
      status: _.in(['unused', 'used'])
    }).count();
    
    const redeemedThisMonth = redeemedCountResult.total;
    const monthlyLimit = 2;
    
    if (redeemedThisMonth >= monthlyLimit) {
      return {
        success: false,
        message: '本月已兑换 2 张优惠券，已达上限（每人每月最多 2 张）'
      };
    }
    
    // 5. 检查积分是否足够
    if (currentPoints < couponConfig.pointsCost) {
      const pointsName = pointsType === 'starlight' ? '星光值' : '晶钻';
      return {
        success: false,
        message: pointsName + '不足，需要 ' + couponConfig.pointsCost + '，当前只有 ' + currentPoints
      };
    }
    
    // 6. 开启事务
    const transaction = await db.startTransaction();
    
    try {
      // 7. 扣减用户积分
      await transaction.collection('members').doc(user._id).update({
        data: {
          [pointsField]: _.inc(-couponConfig.pointsCost)
        }
      });
      
      // 8. 创建优惠券记录（30 天有效期）
      const couponRecord = {
        userId: OPENID,
        dormitoryId: userDormitoryId,
        couponType: couponConfig.couponType,
        couponValue: couponConfig.couponValue,
        minPurchase: couponConfig.minPurchase,
        pointsType: pointsType,
        pointsCost: couponConfig.pointsCost,
        status: 'unused',
        expireAt: now + 30 * 24 * 60 * 60 * 1000, // 30 天后过期
        createdAt: now
      };
      
      const addResult = await transaction.collection('couponRedemptions').add({
        data: couponRecord
      });
      
      // 9. 记录积分流水（可选：如果有 pointsFlow 集合）
      try {
        await transaction.collection('pointsFlow').add({
          data: {
            userId: OPENID,
            dormitoryId: userDormitoryId,
            type: 'redeem',
            pointsType: pointsType,
            amount: -couponConfig.pointsCost,
            balance: currentPoints - couponConfig.pointsCost,
            description: '兑换' + couponConfig.description,
            couponId: addResult._id,
            createdAt: now
          }
        });
      } catch (flowError) {
        // pointsFlow 集合可能不存在，忽略错误
        console.log('⚠️  pointsFlow 集合不存在，跳过流水记录');
      }
      
      // 10. 提交事务
      await transaction.commit();
      
      // 11. 返回结果
      return {
        success: true,
        message: '兑换成功！优惠券已发放到"我的优惠券"',
        data: {
          couponId: addResult._id,
          couponValue: couponConfig.couponValue,
          minPurchase: couponConfig.minPurchase,
          pointsCost: couponConfig.pointsCost,
          pointsType: pointsType,
          expireAt: couponRecord.expireAt,
          remainingPoints: currentPoints - couponConfig.pointsCost
        }
      };
      
    } catch (transactionError) {
      // 事务失败，自动回滚
      await transaction.rollback();
      console.error('事务处理失败:', transactionError);
      throw transactionError;
    }
    
  } catch (error) {
    console.error('兑换优惠券失败:', error);
    return {
      success: false,
      message: '兑换失败：' + error.message
    };
  }
};

/**
 * 获取优惠券配置
 * 根据官方文档：瓜瓜陪伴小程序 - 女生宿舍商业化方案.docx
 * 
 * ⚠️ 核心规则：星光值和晶钻在爻光晶舍不可叠加使用，二选一！
 * 
 * 星光值折扣档位（个人任务获取）：
 * - 3000 分 → 9 折（约 15 天）
 * - 5000 分 → 85 折（约 25 天）
 * - 8000 分 → 8 折（约 40 天）
 * - 10000 分 → 75 折（约 50 天）
 * - 15000 分 → 7 折（约 75 天）
 * 
 * 晶钻抵扣规则（集体任务获取）：
 * - 100 晶钻 → 抵¥10（约 7 天）
 * - 500 晶钻 → 抵¥50（约 33 天）
 * - 1000 晶钻 → 抵¥120（额外赠送 17%）
 * - 2000 晶钻 → 抵¥250（额外赠送 25%）
 * - 5000 晶钻 → 抵¥700（额外赠送 40%）
 */
function getCouponConfig(couponType) {
  const coupons = [
    // ========== 星光值折扣券（个人活跃） ==========
    {
      couponType: 'starlight_discount_90',
      couponValue: 90,  // 9 折
      minPurchase: 0,
      pointsCost: 3000,
      pointsType: 'starlight',
      description: '水晶 9 折折扣券（无门槛）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 15 天'
    },
    {
      couponType: 'starlight_discount_85',
      couponValue: 85,  // 85 折
      minPurchase: 0,
      pointsCost: 5000,
      pointsType: 'starlight',
      description: '水晶 85 折折扣券（无门槛）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 25 天'
    },
    {
      couponType: 'starlight_discount_80',
      couponValue: 80,  // 8 折
      minPurchase: 0,
      pointsCost: 8000,
      pointsType: 'starlight',
      description: '水晶 8 折折扣券（无门槛）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 40 天'
    },
    {
      couponType: 'starlight_discount_75',
      couponValue: 75,  // 75 折
      minPurchase: 0,
      pointsCost: 10000,
      pointsType: 'starlight',
      description: '水晶 75 折折扣券（无门槛）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 50 天'
    },
    {
      couponType: 'starlight_discount_70',
      couponValue: 70,  // 7 折
      minPurchase: 0,
      pointsCost: 15000,
      pointsType: 'starlight',
      description: '水晶 7 折折扣券（无门槛）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 75 天'
    },
    
    // ========== 晶钻抵扣券（集体任务） ==========
    {
      couponType: 'crystal_cash_10',
      couponValue: 10,  // 抵¥10
      minPurchase: 0,
      pointsCost: 100,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥10）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 7 天',
      bonusRate: 0  // 无额外赠送
    },
    {
      couponType: 'crystal_cash_50',
      couponValue: 50,  // 抵¥50
      minPurchase: 0,
      pointsCost: 500,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥50）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 33 天',
      bonusRate: 0  // 无额外赠送
    },
    {
      couponType: 'crystal_cash_120',
      couponValue: 120,  // 抵¥120
      minPurchase: 0,
      pointsCost: 1000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥120，额外赠送 17%）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 67 天',
      bonusRate: 17  // 额外赠送 17%
    },
    {
      couponType: 'crystal_cash_250',
      couponValue: 250,  // 抵¥250
      minPurchase: 0,
      pointsCost: 2000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥250，额外赠送 25%）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 133 天',
      bonusRate: 25  // 额外赠送 25%
    },
    {
      couponType: 'crystal_cash_700',
      couponValue: 700,  // 抵¥700
      minPurchase: 0,
      pointsCost: 5000,
      pointsType: 'crystal',
      description: '晶钻抵扣券（抵¥700，额外赠送 40%）',
      shopName: '爻光晶舍',
      platform: '小红书',
      contact: 'yg-crystal',
      estimateDays: '约 333 天',
      bonusRate: 40  // 额外赠送 40%
    }
  ];
  
  return coupons.find(c => c.couponType === couponType);
}

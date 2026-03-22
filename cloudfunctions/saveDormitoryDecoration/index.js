/**
 * 云函数：saveDormitoryDecoration
 * 功能：保存宿舍装修配置
 * 
 * @input {Array} decorations - 装饰品列表
 * @input {String} dormitoryId - 宿舍 ID
 * @output {Object} 保存结果
 * 
 * @author 玄枢
 * @date 2026-03-17
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 装修评分算法
 * 根据以下维度计算：
 * - 装饰品总价值（30%）
 * - 装饰品稀有度（30%）
 * - 装饰品数量（20%）
 * - 装饰品搭配协调性（20%）
 */
function calculateDecorationScore(decorations, allItems) {
  if (!decorations || decorations.length === 0) {
    return 0;
  }
  
  // 创建道具查找映射
  const itemMap = {};
  allItems.forEach(item => {
    itemMap[item.itemId] = item;
  });
  
  // 1. 装饰品总价值分数（30%）- 满分 300
  let totalValue = 0;
  decorations.forEach(dec => {
    const item = itemMap[dec.itemId];
    if (item) {
      totalValue += item.price || 0;
    }
  });
  // 假设 10000 价值为满分
  const valueScore = Math.min(300, (totalValue / 10000) * 300);
  
  // 2. 装饰品稀有度分数（30%）- 满分 300
  const rarityScores = {
    common: 1,
    rare: 3,
    epic: 6,
    legendary: 10
  };
  let totalRarity = 0;
  decorations.forEach(dec => {
    const item = itemMap[dec.itemId];
    if (item) {
      totalRarity += rarityScores[item.rarity] || 1;
    }
  });
  // 假设平均稀有度 5 为满分
  const avgRarity = totalRarity / decorations.length;
  const rarityScore = Math.min(300, (avgRarity / 5) * 300);
  
  // 3. 装饰品数量分数（20%）- 满分 200
  // 假设 20 个装饰品为满分
  const quantityScore = Math.min(200, (decorations.length / 20) * 200);
  
  // 4. 装饰品搭配协调性（20%）- 满分 200
  // 简化算法：不同类型的装饰品数量越均衡，协调性越高
  const typeCount = {};
  decorations.forEach(dec => {
    typeCount[dec.itemType] = (typeCount[dec.itemType] || 0) + 1;
  });
  const typeValues = Object.values(typeCount);
  const avgTypeCount = decorations.length / typeValues.length;
  // 计算方差，方差越小越协调
  const variance = typeValues.reduce((sum, val) => sum + Math.pow(val - avgTypeCount, 2), 0) / typeValues.length;
  const coordinationScore = Math.max(0, 200 - (variance * 10));
  
  // 总分 = 价值 30% + 稀有度 30% + 数量 20% + 协调性 20%
  const totalScore = Math.round(
    valueScore * 0.3 +
    rarityScore * 0.3 +
    quantityScore * 0.2 +
    coordinationScore * 0.2
  );
  
  return Math.min(1000, totalScore); // 满分 1000
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    // 1. 验证参数
    const { dormitoryId, decorations, layout } = event;
    
    if (!dormitoryId) {
      return {
        success: false,
        message: '缺少宿舍 ID 参数'
      };
    }
    
    if (!decorations || !Array.isArray(decorations)) {
      return {
        success: false,
        message: '装饰品列表格式错误'
      };
    }
    
    // 2. 获取用户信息，验证宿舍归属
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
    
    // 验证用户是否属于该宿舍
    if (user.dormitoryId !== dormitoryId) {
      return {
        success: false,
        message: '您不属于该宿舍，无法修改装修'
      };
    }
    
    // 3. 验证装饰品所有权（防刷机制）
    // 获取用户已购买的装饰品
    const userBagResult = await db.collection('userDecorationBags').where({
      userId: OPENID,
      quantity: _.gt(0)
    }).get();
    
    // 创建用户拥有的道具 ID 集合
    const ownedItemIds = new Set();
    userBagResult.data.forEach(item => {
      if (item.quantity > 0) {
        ownedItemIds.add(item.itemId);
      }
    });
    
    // 验证每个装饰品是否已购买
    for (const dec of decorations) {
      if (!ownedItemIds.has(dec.itemId)) {
        return {
          success: false,
          message: `您未拥有装饰品：${dec.itemId}，请先购买`
        };
      }
    }
    
    // 4. 获取所有道具配置，用于计算评分
    const allItemsResult = await db.collection('decorationItems').get();
    
    // 5. 计算装修评分
    const score = calculateDecorationScore(decorations, allItemsResult.data);
    
    // 6. 准备装修数据
    const decorationData = {
      dormitoryId: dormitoryId,
      decorations: decorations,
      layout: layout || {
        width: 800,
        height: 600,
        gridSize: 50
      },
      score: score,
      lastUpdatedAt: Date.now(),
      updatedBy: OPENID
    };
    
    // 7. 查询是否已有装修记录
    const existingResult = await db.collection('dormitoryDecorations').where({
      dormitoryId: dormitoryId
    }).get();
    
    let saveResult;
    
    if (existingResult.data.length === 0) {
      // 新建记录
      decorationData.createdAt = Date.now();
      saveResult = await db.collection('dormitoryDecorations').add({
        data: decorationData
      });
    } else {
      // 更新记录
      const existingId = existingResult.data[0]._id;
      saveResult = await db.collection('dormitoryDecorations').doc(existingId).update({
        data: decorationData
      });
    }
    
    // 8. 返回结果
    return {
      success: true,
      message: '装修保存成功',
      data: {
        dormitoryId: dormitoryId,
        score: score,
        decorationsCount: decorations.length,
        updatedAt: decorationData.lastUpdatedAt
      }
    };
    
  } catch (error) {
    console.error('保存宿舍装修失败:', error);
    return {
      success: false,
      message: '保存失败：' + error.message,
      error: error
    };
  }
};

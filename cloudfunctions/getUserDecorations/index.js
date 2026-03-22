/**
 * 云函数：getUserDecorations
 * 功能：获取用户已购买的装饰品（背包）
 * 
 * @input {String} type - 可选，筛选类型
 * @output {Object} 用户道具背包
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

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { type, isInUse } = event;
    
    // 1. 构建查询条件
    const query = {
      userId: OPENID,
      quantity: _.gt(0)
    };
    
    if (type) {
      // 需要关联查询道具类型
      // 先获取所有用户道具，再过滤
    }
    
    if (isInUse !== undefined) {
      query.isInUse = isInUse;
    }
    
    // 2. 查询用户背包
    const bagResult = await db.collection('userDecorationBags')
      .where(query)
      .orderBy('purchasedAt', 'desc')
      .get();
    
    if (bagResult.data.length === 0) {
      return {
        success: true,
        message: '背包为空',
        data: {
          items: [],
          totalItems: 0,
          totalValue: 0
        }
      };
    }
    
    // 3. 获取道具详细信息
    const itemIds = bagResult.data.map(item => item.itemId);
    const itemsResult = await db.collection('decorationItems')
      .where({
        itemId: _.in(itemIds)
      })
      .get();
    
    // 创建道具信息映射
    const itemMap = {};
    itemsResult.data.forEach(item => {
      itemMap[item.itemId] = item;
    });
    
    // 4. 合并数据
    const itemsWithDetails = bagResult.data.map(bagItem => {
      const itemInfo = itemMap[bagItem.itemId] || {};
      
      return {
        // 背包信息
        bagId: bagItem._id,
        itemId: bagItem.itemId,
        quantity: bagItem.quantity,
        purchasedAt: bagItem.purchasedAt,
        usedAt: bagItem.usedAt,
        isInUse: bagItem.isInUse,
        
        // 道具信息
        name: itemInfo.name || '未知道具',
        description: itemInfo.description || '',
        type: itemInfo.type || 'unknown',
        subtype: itemInfo.subtype || '',
        price: itemInfo.price || 0,
        currency: itemInfo.currency || 'starlight',
        score: itemInfo.score || 0,
        image: itemInfo.image || '',
        rarity: itemInfo.rarity || 'common',
        
        // 计算总价值
        totalValue: (itemInfo.price || 0) * bagItem.quantity
      };
    });
    
    // 5. 按类型筛选（如果需要）
    let filteredItems = itemsWithDetails;
    if (type) {
      filteredItems = itemsWithDetails.filter(item => item.type === type);
    }
    
    // 6. 按类型分类
    const categorizedItems = {
      furniture: filteredItems.filter(item => item.type === 'furniture'),
      wall: filteredItems.filter(item => item.type === 'wall'),
      floor: filteredItems.filter(item => item.type === 'floor'),
      decoration: filteredItems.filter(item => item.type === 'decoration')
    };
    
    // 7. 统计信息
    const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0);
    const totalScore = filteredItems.reduce((sum, item) => sum + (item.score * item.quantity), 0);
    
    // 8. 返回结果
    return {
      success: true,
      message: '获取成功',
      data: {
        items: filteredItems,
        categorizedItems: categorizedItems,
        statistics: {
          totalItems: totalItems,
          totalValue: totalValue,
          totalScore: totalScore,
          uniqueItems: filteredItems.length
        },
        filters: {
          appliedType: type,
          appliedIsInUse: isInUse
        }
      }
    };
    
  } catch (error) {
    console.error('获取用户装饰品失败:', error);
    return {
      success: false,
      message: '获取失败：' + error.message,
      error: error
    };
  }
};

/**
 * 云函数：getDecorationShop
 * 功能：获取装饰商城数据
 * 
 * @input {String} type - 可选，筛选类型（furniture/wall/floor/decoration）
 * @output {Object} 装饰品列表（按类型分类）
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
    const { type, rarity } = event;
    
    // 1. 构建查询条件
    const query = {
      isEnabled: true
    };
    
    if (type) {
      query.type = type;
    }
    
    if (rarity) {
      query.rarity = rarity;
    }
    
    // 2. 查询装饰品列表
    const itemsResult = await db.collection('decorationItems')
      .where(query)
      .orderBy('sort', 'desc')
      .orderBy('price', 'asc')
      .get();
    
    // 3. 获取用户积分信息
    const userResult = await db.collection('members').where({
      userId: OPENID
    }).get();
    
    let userPoints = {
      starlight: 0,
      crystal: 0
    };
    
    if (userResult.data.length > 0) {
      const user = userResult.data[0];
      userPoints = {
        starlight: user.starlightPoints || 0,
        crystal: user.crystalDiamonds || 0
      };
    }
    
    // 4. 获取用户已拥有的装饰品
    const userBagResult = await db.collection('userDecorationBags').where({
      userId: OPENID,
      quantity: _.gt(0)
    }).get();
    
    const ownedItemIds = new Set();
    userBagResult.data.forEach(item => {
      ownedItemIds.add(item.itemId);
    });
    
    // 5. 按类型分类并标注购买状态
    const categorizedItems = {
      furniture: [],
      wall: [],
      floor: [],
      decoration: []
    };
    
    const itemsWithStatus = itemsResult.data.map(item => {
      const isOwned = ownedItemIds.has(item.itemId);
      const canAfford = userPoints[item.currency] >= item.price;
      
      const itemWithStatus = {
        itemId: item.itemId,
        name: item.name,
        description: item.description,
        type: item.type,
        subtype: item.subtype,
        price: item.price,
        currency: item.currency,
        score: item.score,
        image: item.image,
        rarity: item.rarity,
        isLimited: item.isLimited || false,
        limitEndTime: item.limitEndTime,
        isOwned: isOwned,
        canAfford: canAfford,
        ownedQuantity: isOwned ? (userBagResult.data.find(i => i.itemId === item.itemId)?.quantity || 0) : 0
      };
      
      // 分类
      if (categorizedItems[item.type]) {
        categorizedItems[item.type].push(itemWithStatus);
      }
      
      return itemWithStatus;
    });
    
    // 6. 返回结果
    return {
      success: true,
      message: '获取成功',
      data: {
        items: itemsWithStatus,
        categorizedItems: categorizedItems,
        userPoints: userPoints,
        totalItems: itemsWithStatus.length,
        filters: {
          types: ['furniture', 'wall', 'floor', 'decoration'],
          rarities: ['common', 'rare', 'epic', 'legendary'],
          currencies: ['starlight', 'crystal']
        }
      }
    };
    
  } catch (error) {
    console.error('获取装饰商城失败:', error);
    return {
      success: false,
      message: '获取失败：' + error.message,
      error: error
    };
  }
};

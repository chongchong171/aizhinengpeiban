/**
 * 云函数：buyDecorationItem
 * 功能：购买装饰品
 * 
 * @input {String} itemId - 道具 ID
 * @input {String} currency - 货币类型（starlight/crystal）
 * @input {Number} quantity - 购买数量（默认 1）
 * @output {Object} 购买结果
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
    // 1. 验证参数
    const { itemId, currency, quantity = 1 } = event;
    
    if (!itemId) {
      return {
        success: false,
        message: '缺少道具 ID 参数'
      };
    }
    
    if (!currency || !['starlight', 'crystal'].includes(currency)) {
      return {
        success: false,
        message: '货币类型错误，仅支持 starlight 或 crystal'
      };
    }
    
    if (quantity < 1 || quantity > 99) {
      return {
        success: false,
        message: '购买数量必须在 1-99 之间'
      };
    }
    
    // 2. 获取道具信息
    const itemResult = await db.collection('decorationItems').where({
      itemId: itemId,
      isEnabled: true
    }).get();
    
    if (itemResult.data.length === 0) {
      return {
        success: false,
        message: '道具不存在或已下架'
      };
    }
    
    const item = itemResult.data[0];
    const totalPrice = item.price * quantity;
    
    // 3. 获取用户信息
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
    const userDocId = userResult.data[0]._id;
    
    // 4. 验证积分是否足够
    const pointsField = currency === 'starlight' ? 'starlightPoints' : 'crystalDiamonds';
    const currentPoints = user[pointsField] || 0;
    
    if (currentPoints < totalPrice) {
      const pointsName = currency === 'starlight' ? '星光值' : '晶钻';
      return {
        success: false,
        message: `${pointsName}不足，需要${totalPrice}，当前仅有${currentPoints}`,
        data: {
          required: totalPrice,
          current: currentPoints,
          shortage: totalPrice - currentPoints
        }
      };
    }
    
    // 5. 开启事务（原子操作）
    const transaction = await db.startTransaction();
    
    try {
      // 5.1 扣减用户积分
      await transaction.collection('members').doc(userDocId).update({
        data: {
          [pointsField]: _.inc(-totalPrice)
        }
      });
      
      // 5.2 查询用户背包中是否已有该道具
      const existingBagItem = await transaction.collection('userDecorationBags').where({
        userId: OPENID,
        itemId: itemId
      }).get();
      
      if (existingBagItem.data.length > 0) {
        // 已有该道具，增加数量
        const bagDocId = existingBagItem.data[0]._id;
        await transaction.collection('userDecorationBags').doc(bagDocId).update({
          data: {
            quantity: _.inc(quantity),
            purchasedAt: Date.now()
          }
        });
      } else {
        // 没有该道具，创建新记录
        await transaction.collection('userDecorationBags').add({
          data: {
            userId: OPENID,
            itemId: itemId,
            quantity: quantity,
            purchasedAt: Date.now(),
            usedAt: null,
            isInUse: false
          }
        });
      }
      
      // 5.3 记录积分流水（可选，用于对账）
      await transaction.collection('pointsTransactions').add({
        data: {
          userId: OPENID,
          type: 'decoration_purchase',
          pointsType: currency,
          amount: -totalPrice,
          balance: currentPoints - totalPrice,
          itemId: itemId,
          itemName: item.name,
          quantity: quantity,
          createdAt: Date.now()
        }
      });
      
      // 6. 提交事务
      await transaction.commit();
      
      // 7. 返回结果
      return {
        success: true,
        message: '购买成功',
        data: {
          itemId: itemId,
          itemName: item.name,
          quantity: quantity,
          totalPrice: totalPrice,
          currency: currency,
          newBalance: currentPoints - totalPrice,
          purchasedAt: Date.now()
        }
      };
      
    } catch (transactionError) {
      // 事务失败，回滚
      await transaction.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    console.error('购买装饰品失败:', error);
    return {
      success: false,
      message: '购买失败：' + error.message,
      error: error
    };
  }
};

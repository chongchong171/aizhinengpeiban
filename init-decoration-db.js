/**
 * 数据库初始化脚本 - 女生宿舍装修系统
 * 
 * 用途：初始化装修系统所需的数据库集合和索引
 * 执行方式：在微信开发者工具云开发控制台运行
 * 
 * @author 玄枢
 * @date 2026-03-17
 * @project 瓜瓜陪伴小程序 - 女生宿舍商业化
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 主初始化函数
 */
async function initDecorationDB() {
  console.log('=== 开始初始化装修系统数据库 ===');
  
  try {
    // 1. 创建 dormitoryDecorations 集合
    console.log('\n1. 创建 dormitoryDecorations 集合...');
    await createDormitoryDecorationsCollection();
    
    // 2. 创建 decorationItems 集合
    console.log('\n2. 创建 decorationItems 集合...');
    await createDecorationItemsCollection();
    
    // 3. 创建 userDecorationBags 集合（用户道具背包）
    console.log('\n3. 创建 userDecorationBags 集合...');
    await createUserDecorationBagsCollection();
    
    // 4. 创建 decorationRankingCache 集合（排行榜缓存）
    console.log('\n4. 创建 decorationRankingCache 集合...');
    await createDecorationRankingCacheCollection();
    
    console.log('\n=== 装修系统数据库初始化完成 ===');
    console.log('\n📋 集合列表：');
    console.log('   - dormitoryDecorations: 宿舍装修配置');
    console.log('   - decorationItems: 装饰品商城配置');
    console.log('   - userDecorationBags: 用户道具背包');
    console.log('   - decorationRankingCache: 装修排行榜缓存');
    
    return {
      success: true,
      message: '装修系统数据库初始化成功',
      collections: [
        'dormitoryDecorations',
        'decorationItems',
        'userDecorationBags',
        'decorationRankingCache'
      ]
    };
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      message: '初始化失败：' + error.message,
      error: error
    };
  }
}

/**
 * 创建 dormitoryDecorations 集合（宿舍装修配置）
 */
async function createDormitoryDecorationsCollection() {
  try {
    await db.createCollection('dormitoryDecorations');
    console.log('✓ dormitoryDecorations 集合创建成功');
    
    const collection = db.collection('dormitoryDecorations');
    
    // 创建索引：dormitoryId（唯一索引）
    try {
      await collection.createIndex('dormitoryId', {
        dormitoryId: 1
      }, { unique: true });
      console.log('✓ 索引 dormitoryId 创建成功');
    } catch (e) {
      console.log('⚠️  索引 dormitoryId 可能已存在');
    }
    
    // 创建索引：score（降序，用于排行榜）
    try {
      await collection.createIndex('score', {
        score: -1
      });
      console.log('✓ 索引 score 创建成功');
    } catch (e) {
      console.log('⚠️  索引 score 可能已存在');
    }
    
    // 创建索引：lastUpdatedAt（降序）
    try {
      await collection.createIndex('lastUpdatedAt', {
        lastUpdatedAt: -1
      });
      console.log('✓ 索引 lastUpdatedAt 创建成功');
    } catch (e) {
      console.log('⚠️  索引 lastUpdatedAt 可能已存在');
    }
    
    console.log('\n📋 dormitoryDecorations 集合字段说明：');
    console.log('   - _id: String（记录 ID）');
    console.log('   - dormitoryId: String（宿舍 ID，唯一）');
    console.log('   - decorations: Array（已购买的装饰品列表）');
    console.log('     - itemId: String（道具 ID）');
    console.log('     - itemType: String（类型：furniture/wall/floor/decoration）');
    console.log('     - position: Object（位置：x, y, rotation）');
    console.log('     - purchasedAt: Number（购买时间戳）');
    console.log('   - layout: Object（宿舍布局配置）');
    console.log('     - width: Number（宽度）');
    console.log('     - height: Number（高度）');
    console.log('     - gridSize: Number（网格大小）');
    console.log('   - score: Number（装修评分）');
    console.log('   - lastUpdatedAt: Number（最后更新时间戳）');
    console.log('   - updatedBy: String（最后更新的用户 openid）');
    console.log('   - createdAt: Number（创建时间戳）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  dormitoryDecorations 集合已存在');
      return true;
    }
    throw error;
  }
}

/**
 * 创建 decorationItems 集合（道具配置）
 */
async function createDecorationItemsCollection() {
  try {
    await db.createCollection('decorationItems');
    console.log('✓ decorationItems 集合创建成功');
    
    const collection = db.collection('decorationItems');
    
    // 创建索引：itemId（唯一索引）
    try {
      await collection.createIndex('itemId', {
        itemId: 1
      }, { unique: true });
      console.log('✓ 索引 itemId 创建成功');
    } catch (e) {
      console.log('⚠️  索引 itemId 可能已存在');
    }
    
    // 创建索引：type + rarity（用于筛选）
    try {
      await collection.createIndex('type_rarity', {
        type: 1,
        rarity: 1
      });
      console.log('✓ 索引 type_rarity 创建成功');
    } catch (e) {
      console.log('⚠️  索引 type_rarity 可能已存在');
    }
    
    // 创建索引：price（用于排序）
    try {
      await collection.createIndex('price', {
        price: 1
      });
      console.log('✓ 索引 price 创建成功');
    } catch (e) {
      console.log('⚠️  索引 price 可能已存在');
    }
    
    console.log('\n📋 decorationItems 集合字段说明：');
    console.log('   - _id: String（记录 ID）');
    console.log('   - itemId: String（道具 ID，唯一）');
    console.log('   - name: String（道具名称）');
    console.log('   - description: String（道具描述）');
    console.log('   - type: String（类型：furniture/wall/floor/decoration）');
    console.log('   - subtype: String（具体类型：bed/desk/chair/etc）');
    console.log('   - price: Number（价格）');
    console.log('   - currency: String（货币类型：starlight/crystal）');
    console.log('   - score: Number（装饰评分，用于计算装修总分）');
    console.log('   - image: String（图标 URL）');
    console.log('   - rarity: String（稀有度：common/rare/epic/legendary）');
    console.log('   - isLimited: Boolean（是否限定，默认 false）');
    console.log('   - limitEndTime: Number（限定结束时间，可选）');
    console.log('   - sort: Number（排序权重，默认 0）');
    console.log('   - isEnabled: Boolean（是否启用，默认 true）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  decorationItems 集合已存在');
      return true;
    }
    throw error;
  }
}

/**
 * 创建 userDecorationBags 集合（用户道具背包）
 */
async function createUserDecorationBagsCollection() {
  try {
    await db.createCollection('userDecorationBags');
    console.log('✓ userDecorationBags 集合创建成功');
    
    const collection = db.collection('userDecorationBags');
    
    // 创建复合索引：userId + itemId（唯一）
    try {
      await collection.createIndex('userId_itemId', {
        userId: 1,
        itemId: 1
      }, { unique: true });
      console.log('✓ 索引 userId_itemId 创建成功');
    } catch (e) {
      console.log('⚠️  索引 userId_itemId 可能已存在');
    }
    
    // 创建索引：userId
    try {
      await collection.createIndex('userId', {
        userId: 1
      });
      console.log('✓ 索引 userId 创建成功');
    } catch (e) {
      console.log('⚠️  索引 userId 可能已存在');
    }
    
    console.log('\n📋 userDecorationBags 集合字段说明：');
    console.log('   - _id: String（记录 ID）');
    console.log('   - userId: String（用户 openid）');
    console.log('   - itemId: String（道具 ID）');
    console.log('   - quantity: Number（数量，默认 1）');
    console.log('   - purchasedAt: Number（购买时间戳）');
    console.log('   - usedAt: Number（使用时间戳，可选）');
    console.log('   - isInUse: Boolean（是否正在使用，默认 false）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  userDecorationBags 集合已存在');
      return true;
    }
    throw error;
  }
}

/**
 * 创建 decorationRankingCache 集合（排行榜缓存）
 */
async function createDecorationRankingCacheCollection() {
  try {
    await db.createCollection('decorationRankingCache');
    console.log('✓ decorationRankingCache 集合创建成功');
    
    const collection = db.collection('decorationRankingCache');
    
    // 创建索引：cacheKey（唯一）
    try {
      await collection.createIndex('cacheKey', {
        cacheKey: 1
      }, { unique: true });
      console.log('✓ 索引 cacheKey 创建成功');
    } catch (e) {
      console.log('⚠️  索引 cacheKey 可能已存在');
    }
    
    // 创建索引：expireAt（用于过期清理）
    try {
      await collection.createIndex('expireAt', {
        expireAt: 1
      });
      console.log('✓ 索引 expireAt 创建成功');
    } catch (e) {
      console.log('⚠️  索引 expireAt 可能已存在');
    }
    
    console.log('\n📋 decorationRankingCache 集合字段说明：');
    console.log('   - _id: String（记录 ID）');
    console.log('   - cacheKey: String（缓存键：ranking:daily/weekly/monthly）');
    console.log('   - rankingData: Array（排行榜数据）');
    console.log('   - generatedAt: Number（生成时间戳）');
    console.log('   - expireAt: Number（过期时间戳）');
    
    return true;
  } catch (error) {
    if (error.errCode === -502002) {
      console.log('⚠️  decorationRankingCache 集合已存在');
      return true;
    }
    throw error;
  }
}

// 导出主函数
exports.main = async (event, context) => {
  return await initDecorationDB();
};

// 如果直接运行此文件（本地调试）
if (require.main === module) {
  initDecorationDB().then(result => {
    console.log('\n初始化结果:', JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('\n初始化失败:', error);
  });
}

module.exports = { initDecorationDB };

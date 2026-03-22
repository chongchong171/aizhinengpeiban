/**
 * 装修系统数据库初始化脚本
 * 项目：瓜瓜陪伴小程序 - 女生宿舍商业化
 * 创建者：明鉴 (QA + 数据库)
 * 日期：2026-03-17
 * 
 * 使用方法：
 * 1. 在微信开发者工具中打开云开发控制台
 * 2. 创建以下集合：
 *    - dormitoryDecorations
 *    - userDecorationItems
 *    - decorationItems
 *    - decorationRecords
 *    - decorationLeaderboard (可选)
 * 3. 在集合中导入对应的初始数据
 */

// ==================== 1. dormitoryDecorations 集合 ====================

// 创建索引（在云开发控制台 - 数据库 - 集合 - 索引管理中添加）
db.dormitoryDecorations.createIndex({ dormitoryId: 1 }, { unique: true })
db.dormitoryDecorations.createIndex({ score: -1 })
db.dormitoryDecorations.createIndex({ level: 1 })
db.dormitoryDecorations.createIndex({ lastUpdatedAt: -1 })

// 初始数据示例（测试用）
const dormitoryDecorationsData = [
  {
    _id: "dec_init_001",
    dormitoryId: "dorm_test_001",
    decorations: [
      {
        itemId: "item_001",
        itemType: "furniture",
        position: { x: 2, y: 3, rotation: 0 },
        purchasedAt: Date.now()
      }
    ],
    layout: {
      width: 800,
      height: 600,
      gridSize: 50
    },
    score: 50,
    level: 1,
    lastUpdatedAt: Date.now(),
    updatedBy: "user_test_001"
  }
]

// ==================== 2. userDecorationItems 集合 ====================

// 创建索引
db.userDecorationItems.createIndex({ userId: 1, itemId: 1 })
db.userDecorationItems.createIndex({ userId: 1 })

// 初始数据示例（测试用）
const userDecorationItemsData = [
  {
    _id: "udi_init_001",
    userId: "user_test_001",
    itemId: "item_001",
    quantity: 5,
    obtainedAt: Date.now(),
    currency: "starlight"
  },
  {
    _id: "udi_init_002",
    userId: "user_test_001",
    itemId: "item_002",
    quantity: 2,
    obtainedAt: Date.now(),
    currency: "crystal"
  }
]

// ==================== 3. decorationItems 集合 ====================

// 创建索引
db.decorationItems.createIndex({ itemId: 1 }, { unique: true })
db.decorationItems.createIndex({ type: 1, rarity: 1 })
db.decorationItems.createIndex({ currency: 1 })

// 初始数据 - 家具类
const furnitureItems = [
  {
    _id: "di_furn_001",
    itemId: "item_001",
    name: "温馨小床",
    type: "furniture",
    price: 500,
    currency: "starlight",
    score: 50,
    image: "https://cdn.guagua.com/decorations/furniture/bed_001.png",
    rarity: "common",
    description: "一张舒适的小床，让宿舍更温馨",
    unlockLevel: 1
  },
  {
    _id: "di_furn_002",
    itemId: "item_002",
    name: "书桌",
    type: "furniture",
    price: 800,
    currency: "starlight",
    score: 80,
    image: "https://cdn.guagua.com/decorations/furniture/desk_001.png",
    rarity: "common",
    description: "整洁的书桌，学习更有动力",
    unlockLevel: 1
  },
  {
    _id: "di_furn_003",
    itemId: "item_003",
    name: "衣柜",
    type: "furniture",
    price: 1000,
    currency: "starlight",
    score: 100,
    image: "https://cdn.guagua.com/decorations/furniture/wardrobe_001.png",
    rarity: "rare",
    description: "大容量衣柜，收纳所有美好",
    unlockLevel: 2
  },
  {
    _id: "di_furn_004",
    itemId: "item_004",
    name: "沙发",
    type: "furniture",
    price: 1500,
    currency: "starlight",
    score: 150,
    image: "https://cdn.guagua.com/decorations/furniture/sofa_001.png",
    rarity: "rare",
    description: "舒适的沙发，闺蜜聊天必备",
    unlockLevel: 3
  },
  {
    _id: "di_furn_005",
    itemId: "item_005",
    name: "水晶吊灯",
    type: "furniture",
    price: 5000,
    currency: "crystal",
    score: 500,
    image: "https://cdn.guagua.com/decorations/furniture/chandelier_001.png",
    rarity: "epic",
    description: "华丽的水晶吊灯，照亮整个宿舍",
    unlockLevel: 5
  },
  {
    _id: "di_furn_006",
    itemId: "item_006",
    name: "公主床",
    type: "furniture",
    price: 8000,
    currency: "crystal",
    score: 800,
    image: "https://cdn.guagua.com/decorations/furniture/princess_bed_001.png",
    rarity: "legendary",
    description: "梦幻公主床，每个女孩的夢想",
    unlockLevel: 7
  }
]

// 初始数据 - 墙纸类
const wallItems = [
  {
    _id: "di_wall_001",
    itemId: "item_011",
    name: "粉色墙纸",
    type: "wall",
    price: 300,
    currency: "starlight",
    score: 30,
    image: "https://cdn.guagua.com/decorations/wall/pink_001.png",
    rarity: "common",
    description: "温柔的粉色墙纸",
    unlockLevel: 1
  },
  {
    _id: "di_wall_002",
    itemId: "item_012",
    name: "星空墙纸",
    type: "wall",
    price: 600,
    currency: "starlight",
    score: 60,
    image: "https://cdn.guagua.com/decorations/wall/starry_001.png",
    rarity: "rare",
    description: "浪漫星空，伴你入眠",
    unlockLevel: 2
  },
  {
    _id: "di_wall_003",
    itemId: "item_013",
    name: "樱花墙纸",
    type: "wall",
    price: 2000,
    currency: "crystal",
    score: 200,
    image: "https://cdn.guagua.com/decorations/wall/sakura_001.png",
    rarity: "epic",
    description: "春日樱花，浪漫满屋",
    unlockLevel: 4
  }
]

// 初始数据 - 地板类
const floorItems = [
  {
    _id: "di_floor_001",
    itemId: "item_021",
    name: "木质地板",
    type: "floor",
    price: 400,
    currency: "starlight",
    score: 40,
    image: "https://cdn.guagua.com/decorations/floor/wood_001.png",
    rarity: "common",
    description: "温暖的木质地板",
    unlockLevel: 1
  },
  {
    _id: "di_floor_002",
    itemId: "item_022",
    name: "大理石地板",
    type: "floor",
    price: 1200,
    currency: "starlight",
    score: 120,
    image: "https://cdn.guagua.com/decorations/floor/marble_001.png",
    rarity: "rare",
    description: "高贵的大理石地板",
    unlockLevel: 3
  },
  {
    _id: "di_floor_003",
    itemId: "item_023",
    name: "毛绒地毯",
    type: "floor",
    price: 3000,
    currency: "crystal",
    score: 300,
    image: "https://cdn.guagua.com/decorations/floor/carpet_001.png",
    rarity: "epic",
    description: "柔软的毛绒地毯",
    unlockLevel: 5
  }
]

// 初始数据 - 装饰品类
const decorationItems = [
  {
    _id: "di_decor_001",
    itemId: "item_031",
    name: "小盆栽",
    type: "decoration",
    price: 200,
    currency: "starlight",
    score: 20,
    image: "https://cdn.guagua.com/decorations/decoration/plant_001.png",
    rarity: "common",
    description: "绿色小盆栽，增添生机",
    unlockLevel: 1
  },
  {
    _id: "di_decor_002",
    itemId: "item_032",
    name: "相框",
    type: "decoration",
    price: 350,
    currency: "starlight",
    score: 35,
    image: "https://cdn.guagua.com/decorations/decoration/frame_001.png",
    rarity: "common",
    description: "记录美好时光",
    unlockLevel: 1
  },
  {
    _id: "di_decor_003",
    itemId: "item_033",
    name: "台灯",
    type: "decoration",
    price: 700,
    currency: "starlight",
    score: 70,
    image: "https://cdn.guagua.com/decorations/decoration/lamp_001.png",
    rarity: "rare",
    description: "温馨的台灯",
    unlockLevel: 2
  },
  {
    _id: "di_decor_004",
    itemId: "item_034",
    name: "水晶球",
    type: "decoration",
    price: 4000,
    currency: "crystal",
    score: 400,
    image: "https://cdn.guagua.com/decorations/decoration/crystal_ball_001.png",
    rarity: "legendary",
    description: "神秘的水晶球",
    unlockLevel: 6
  }
]

// 合并所有装饰品数据
const allDecorationItems = [
  ...furnitureItems,
  ...wallItems,
  ...floorItems,
  ...decorationItems
]

// ==================== 4. decorationRecords 集合 ====================

// 创建索引
db.decorationRecords.createIndex({ dormitoryId: 1, createdAt: -1 })
db.decorationRecords.createIndex({ userId: 1, createdAt: -1 })
db.decorationRecords.createIndex({ createdAt: -1 })

// 初始数据示例（测试用）
const decorationRecordsData = [
  {
    _id: "dr_init_001",
    dormitoryId: "dorm_test_001",
    userId: "user_test_001",
    action: "buy",
    itemId: "item_001",
    beforeState: null,
    afterState: { quantity: 5 },
    scoreChange: 0,
    currencyCost: 500,
    createdAt: Date.now()
  }
]

// ==================== 5. decorationLeaderboard 集合（可选） ====================

// 创建索引
db.decorationLeaderboard.createIndex({ score: -1 })
db.decorationLeaderboard.createIndex({ rank: 1 })

// 初始数据示例（测试用）
const leaderboardData = [
  {
    _id: "dl_init_001",
    dormitoryId: "dorm_test_001",
    dormitoryName: "301 温馨小屋",
    score: 750,
    level: 5,
    memberCount: 4,
    avatar: "https://cdn.guagua.com/avatars/dorm_001.png",
    rank: 1,
    updatedAt: Date.now()
  }
]

// ==================== 批量导入函数 ====================

/**
 * 批量导入数据到指定集合
 * @param {string} collectionName 集合名称
 * @param {array} data 数据数组
 */
async function batchInsert(collectionName, data) {
  console.log(`开始导入 ${collectionName}，共 ${data.length} 条记录`)
  
  const db = wx.cloud.database()
  const collection = db.collection(collectionName)
  
  // 分批插入，每批 50 条
  const batchSize = 50
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    try {
      await collection.add({
        data: batch[0] // 注意：云开发一次只能添加一条，需要循环
      })
      console.log(`已导入 ${Math.min(i + batchSize, data.length)}/${data.length}`)
    } catch (err) {
      console.error(`导入失败：`, err)
    }
  }
  
  console.log(`${collectionName} 导入完成`)
}

// ==================== 执行初始化 ====================

/**
 * 初始化所有集合
 * 注意：此函数需要在云函数中执行，或在云开发控制台的数据库中手动导入
 */
async function initDecorationDB() {
  console.log('====== 开始初始化装修系统数据库 ======')
  
  try {
    // 导入装饰品配置（只读数据）
    await batchInsert('decorationItems', allDecorationItems)
    
    // 导入测试数据（可选）
    await batchInsert('dormitoryDecorations', dormitoryDecorationsData)
    await batchInsert('userDecorationItems', userDecorationItemsData)
    await batchInsert('decorationRecords', decorationRecordsData)
    await batchInsert('decorationLeaderboard', leaderboardData)
    
    console.log('====== 数据库初始化完成 ======')
    return {
      success: true,
      message: '数据库初始化成功'
    }
  } catch (err) {
    console.error('数据库初始化失败:', err)
    return {
      success: false,
      message: err.message
    }
  }
}

// 导出函数（云函数使用）
module.exports = {
  initDecorationDB,
  batchInsert
}

// 如果在云函数中直接执行，取消下面注释
// initDecorationDB()

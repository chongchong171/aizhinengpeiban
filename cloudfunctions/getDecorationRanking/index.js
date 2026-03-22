/**
 * 云函数：getDecorationRanking
 * 功能：获取装修排行榜
 * 
 * @input {Number} limit - 返回数量（默认 20）
 * @input {Number} offset - 偏移量（默认 0）
 * @input {String} rankingType - 排行榜类型（daily/weekly/monthly/all，默认 all）
 * @output {Object} 排行榜列表
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

// 缓存配置（单位：秒）
const CACHE_CONFIG = {
  daily: 300,      // 日榜 5 分钟
  weekly: 600,     // 周榜 10 分钟
  monthly: 900,    // 月榜 15 分钟
  all: 1800        // 总榜 30 分钟
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    // 1. 解析参数
    const {
      limit = 20,
      offset = 0,
      rankingType = 'all'
    } = event;
    
    // 验证参数
    if (limit < 1 || limit > 100) {
      return {
        success: false,
        message: 'limit 必须在 1-100 之间'
      };
    }
    
    if (offset < 0) {
      return {
        success: false,
        message: 'offset 不能为负数'
      };
    }
    
    if (!['daily', 'weekly', 'monthly', 'all'].includes(rankingType)) {
      return {
        success: false,
        message: 'rankingType 必须是 daily/weekly/monthly/all'
      };
    }
    
    // 2. 尝试从缓存获取
    const cacheKey = `ranking:${rankingType}`;
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      // 缓存命中，返回分页数据
      const paginatedData = cachedData.slice(offset, offset + limit);
      
      return {
        success: true,
        message: '获取成功（缓存）',
        data: {
          ranking: paginatedData,
          total: cachedData.length,
          limit: limit,
          offset: offset,
          rankingType: rankingType,
          fromCache: true,
          cacheGeneratedAt: cachedData.cacheGeneratedAt
        },
        fromCache: true
      };
    }
    
    // 3. 缓存未命中，从数据库查询
    const now = Date.now();
    
    // 计算时间范围
    let startTime = 0;
    if (rankingType === 'daily') {
      // 今日 0 点
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    } else if (rankingType === 'weekly') {
      // 本周一 0 点
      const today = new Date();
      const dayOfWeek = today.getDay() || 7; // 周日为 0，转为 7
      today.setDate(today.getDate() - dayOfWeek + 1);
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    } else if (rankingType === 'monthly') {
      // 本月 1 日 0 点
      const today = new Date();
      today.setDate(1);
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    }
    
    // 4. 查询宿舍装修数据
    const query = {};
    
    // 如果有限时排行，筛选最后更新时间
    if (startTime > 0) {
      query.lastUpdatedAt = _.gte(startTime);
    }
    
    // 只查询有装修的宿舍
    query.score = _.gt(0);
    
    const decorationsResult = await db.collection('dormitoryDecorations')
      .where(query)
      .orderBy('score', 'desc')
      .skip(offset)
      .limit(limit)
      .get();
    
    // 5. 获取宿舍信息
    const dormitoryIds = decorationsResult.data.map(d => d.dormitoryId);
    
    // 查询宿舍成员信息（用于获取宿舍名称、成员头像等）
    const membersResult = await db.collection('members')
      .where({
        dormitoryId: _.in(dormitoryIds)
      })
      .get();
    
    // 按宿舍 ID 分组
    const dormitoryMembers = {};
    membersResult.data.forEach(member => {
      if (!dormitoryMembers[member.dormitoryId]) {
        dormitoryMembers[member.dormitoryId] = [];
      }
      dormitoryMembers[member.dormitoryId].push({
        userId: member.userId,
        nickname: member.nickname,
        avatar: member.avatar
      });
    });
    
    // 6. 组装排行榜数据
    const ranking = decorationsResult.data.map((decoration, index) => {
      const members = dormitoryMembers[decoration.dormitoryId] || [];
      
      return {
        rank: offset + index + 1,
        dormitoryId: decoration.dormitoryId,
        score: decoration.score,
        decorationsCount: (decoration.decorations || []).length,
        lastUpdatedAt: decoration.lastUpdatedAt,
        updatedBy: decoration.updatedBy,
        members: members.slice(0, 4), // 最多显示 4 个成员
        membersCount: members.length,
        // 根据评分给出等级
        level: getRankingLevel(decoration.score)
      };
    });
    
    // 7. 获取总数量（用于分页）
    const countResult = await db.collection('dormitoryDecorations')
      .where(query)
      .count();
    
    // 8. 缓存结果（缓存完整列表，不分页）
    if (offset === 0) {
      // 只在查询第一页时缓存完整数据
      await cacheRanking(cacheKey, ranking, CACHE_CONFIG[rankingType]);
    }
    
    // 9. 返回结果
    return {
      success: true,
      message: '获取成功',
      data: {
        ranking: ranking,
        total: countResult.total,
        limit: limit,
        offset: offset,
        rankingType: rankingType,
        fromCache: false,
        hasMore: (offset + limit) < countResult.total
      }
    };
    
  } catch (error) {
    console.error('获取装修排行榜失败:', error);
    return {
      success: false,
      message: '获取失败：' + error.message,
      error: error
    };
  }
};

/**
 * 从缓存获取数据
 */
async function getFromCache(cacheKey) {
  try {
    const cacheResult = await db.collection('decorationRankingCache').where({
      cacheKey: cacheKey
    }).get();
    
    if (cacheResult.data.length === 0) {
      return null;
    }
    
    const cache = cacheResult.data[0];
    
    // 检查是否过期
    if (cache.expireAt < Date.now()) {
      // 清理过期缓存
      await db.collection('decorationRankingCache').doc(cache._id).remove();
      return null;
    }
    
    return cache.rankingData;
    
  } catch (error) {
    console.error('读取缓存失败:', error);
    return null;
  }
}

/**
 * 缓存排行榜数据
 */
async function cacheRanking(cacheKey, rankingData, expireSeconds) {
  try {
    const now = Date.now();
    const expireAt = now + (expireSeconds * 1000);
    
    // 准备缓存数据
    const cacheData = {
      cacheKey: cacheKey,
      rankingData: rankingData,
      generatedAt: now,
      expireAt: expireAt
    };
    
    // 查询是否已有缓存
    const existingCache = await db.collection('decorationRankingCache').where({
      cacheKey: cacheKey
    }).get();
    
    if (existingCache.data.length > 0) {
      // 更新缓存
      await db.collection('decorationRankingCache').doc(existingCache.data[0]._id).update({
        data: cacheData
      });
    } else {
      // 创建缓存
      await db.collection('decorationRankingCache').add({
        data: cacheData
      });
    }
    
  } catch (error) {
    console.error('写入缓存失败:', error);
    // 缓存失败不影响主流程
  }
}

/**
 * 根据评分获取等级
 */
function getRankingLevel(score) {
  if (score >= 800) return 'legendary';  // 传说
  if (score >= 600) return 'epic';       // 史诗
  if (score >= 400) return 'rare';       // 稀有
  if (score >= 200) return 'uncommon';   // 优秀
  return 'common';                        // 普通
}

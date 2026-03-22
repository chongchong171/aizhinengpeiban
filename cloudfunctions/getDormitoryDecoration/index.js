/**
 * 云函数：getDormitoryDecoration
 * 功能：获取宿舍装修配置
 * 
 * @input {String} dormitoryId - 宿舍 ID
 * @output {Object} 装修配置 + 装饰品列表
 * 
 * @author 玄枢
 * @date 2026-03-17
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    // 1. 验证参数
    const { dormitoryId } = event;
    
    if (!dormitoryId) {
      return {
        success: false,
        message: '缺少宿舍 ID 参数'
      };
    }
    
    // 2. 查询宿舍装修配置
    const decorationResult = await db.collection('dormitoryDecorations').where({
      dormitoryId: dormitoryId
    }).get();
    
    // 3. 如果没有装修记录，返回默认配置
    if (decorationResult.data.length === 0) {
      return {
        success: true,
        message: '该宿舍暂无装修',
        data: {
          dormitoryId: dormitoryId,
          decorations: [],
          layout: {
            width: 800,
            height: 600,
            gridSize: 50
          },
          score: 0,
          lastUpdatedAt: null,
          updatedBy: null,
          isEmpty: true
        }
      };
    }
    
    const decoration = decorationResult.data[0];
    
    // 4. 返回装修配置
    return {
      success: true,
      message: '获取成功',
      data: {
        dormitoryId: decoration.dormitoryId,
        decorations: decoration.decorations || [],
        layout: decoration.layout || {
          width: 800,
          height: 600,
          gridSize: 50
        },
        score: decoration.score || 0,
        lastUpdatedAt: decoration.lastUpdatedAt,
        updatedBy: decoration.updatedBy,
        isEmpty: false
      }
    };
    
  } catch (error) {
    console.error('获取宿舍装修失败:', error);
    return {
      success: false,
      message: '获取失败：' + error.message,
      error: error
    };
  }
};

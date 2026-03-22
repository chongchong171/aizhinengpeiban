// 云函数：更新宿舍公约
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { dormitoryId, agreement } = event;
    
    if (!dormitoryId) {
      return {
        success: false,
        message: '宿舍 ID 不能为空'
      };
    }
    
    // 检查用户是否是创建者
    const dormitory = await db.collection('dormitories').doc(dormitoryId).get();
    
    if (!dormitory.data) {
      return {
        success: false,
        message: '宿舍不存在'
      };
    }
    
    if (dormitory.data.creator !== OPENID) {
      return {
        success: false,
        message: '只有宿舍创建者可以修改公约'
      };
    }
    
    // 更新公约
    await db.collection('dormitories').doc(dormitoryId).update({
      data: {
        agreement: agreement || ''
      }
    });
    
    return {
      success: true,
      message: '公约更新成功'
    };
    
  } catch (error) {
    console.error('更新公约失败:', error);
    return {
      success: false,
      message: '更新失败：' + error.message
    };
  }
};

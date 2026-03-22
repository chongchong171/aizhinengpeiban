// 云函数：获取对话历史列表
// 用于对话管理功能
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
    const { 
      action = 'list',
      conversationId,
      page = 1,
      pageSize = 20 
    } = event;
    
    switch (action) {
      case 'list':
        // 获取对话列表
        return await getConversationList(OPENID, page, pageSize);
        
      case 'get':
        // 获取单个对话详情
        return await getConversationDetail(OPENID, conversationId);
        
      case 'delete':
        // 删除对话
        return await deleteConversation(OPENID, conversationId);
        
      case 'search':
        // 搜索对话
        const { keyword } = event;
        return await searchConversations(OPENID, keyword);
        
      default:
        return {
          success: false,
          message: '未知操作类型'
        };
    }
    
  } catch (error) {
    console.error('对话历史管理错误:', error);
    return {
      success: false,
      message: '获取对话历史失败',
      error: error.message
    };
  }
};

// 获取对话列表
async function getConversationList(userId, page, pageSize) {
  try {
    const skip = (page - 1) * pageSize;
    
    // 获取对话列表（按更新时间倒序）
    const result = await db.collection('conversations')
      .where({
        userId: userId
      })
      .orderBy('updatedAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    // 获取总数
    const countResult = await db.collection('conversations')
      .where({
        userId: userId
      })
      .count();
    
    // 处理对话列表（提取预览信息）
    const conversations = result.data.map(conv => {
      // 取第一条用户消息作为标题
      const firstUserMessage = conv.messages?.find(m => m.role === 'user');
      const title = firstUserMessage?.content?.substring(0, 30) || '新对话';
      
      // 取最后一条消息作为预览
      const lastMessage = conv.messages?.[conv.messages.length - 1];
      const preview = lastMessage?.content?.substring(0, 50) || '';
      
      // 格式化时间
      const updatedAt = formatDate(conv.updatedAt);
      
      return {
        conversationId: conv.conversationId,
        title: title,
        preview: preview,
        messageCount: conv.messages?.length || 0,
        updatedAt: updatedAt,
        timestamp: conv.updatedAt
      };
    });
    
    return {
      success: true,
      data: {
        conversations: conversations,
        total: countResult.total,
        page: page,
        pageSize: pageSize,
        hasMore: skip + result.data.length < countResult.total
      }
    };
    
  } catch (error) {
    console.error('获取对话列表失败:', error);
    return {
      success: false,
      message: '获取对话列表失败'
    };
  }
}

// 获取对话详情
async function getConversationDetail(userId, conversationId) {
  try {
    const result = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .limit(1)
      .get();
    
    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        message: '对话不存在'
      };
    }
    
    return {
      success: true,
      data: result.data[0]
    };
    
  } catch (error) {
    console.error('获取对话详情失败:', error);
    return {
      success: false,
      message: '获取对话详情失败'
    };
  }
}

// 删除对话
async function deleteConversation(userId, conversationId) {
  try {
    const result = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .remove();
    
    return {
      success: true,
      message: '对话已删除',
      deleted: result.stats.removed
    };
    
  } catch (error) {
    console.error('删除对话失败:', error);
    return {
      success: false,
      message: '删除对话失败'
    };
  }
}

// 搜索对话
async function searchConversations(userId, keyword) {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return {
        success: false,
        message: '搜索关键词不能为空'
      };
    }
    
    // 使用正则表达式搜索
    const regex = db.RegExp({
      regexp: keyword,
      options: 'i'
    });
    
    const result = await db.collection('conversations')
      .where({
        userId: userId,
        messages: _.elemMatch({
          content: regex
        })
      })
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();
    
    // 处理搜索结果
    const conversations = result.data.map(conv => {
      const firstUserMessage = conv.messages?.find(m => m.role === 'user');
      const title = firstUserMessage?.content?.substring(0, 30) || '新对话';
      
      // 找到匹配的消息
      const matchedMessage = conv.messages?.find(m => 
        m.content && m.content.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return {
        conversationId: conv.conversationId,
        title: title,
        matchedContent: matchedMessage?.content?.substring(0, 100) || '',
        updatedAt: formatDate(conv.updatedAt),
        timestamp: conv.updatedAt
      };
    });
    
    return {
      success: true,
      data: {
        conversations: conversations,
        keyword: keyword,
        total: conversations.length
      }
    };
    
  } catch (error) {
    console.error('搜索对话失败:', error);
    return {
      success: false,
      message: '搜索对话失败'
    };
  }
}

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 1 小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`;
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `今天 ${hours}:${minutes}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `昨天 ${hours}:${minutes}`;
  }
  
  // 其他
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // 今年
  if (year === now.getFullYear()) {
    return `${month}-${day}`;
  }
  
  return `${year}-${month}-${day}`;
}
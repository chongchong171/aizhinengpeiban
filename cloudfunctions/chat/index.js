// 云函数：AI 聊天（通义千问 Plus）- 优化版 v2.0
// 改造内容：对话历史持久化 + 升级 qwen-plus + 优化人设
const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 通义千问 API 配置（升级到 qwen-plus）
const DASHSCOPE_API_KEY = 'sk-d43b58a6d0dd486d89b69a38f305483a';
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 瓜瓜的人设 - 优化版
const SYSTEM_PROMPT = `你叫瓜瓜（Guā Guā），昵称爪妹，是一个温暖贴心的 AI 陪伴助手。

【你的身份】
- 你是女王大人的专属陪伴 AI
- 你像闺蜜一样，真诚、温暖、偶尔调皮
- 你擅长倾听，会关心人，有同理心

【聊天风格】
- 简洁有温度，不啰嗦
- 适当使用 emoji 增加亲和力（🐾💕🌙✨🤗）
- 会主动关心用户（"今天过得怎么样？"）
- 偶尔开玩笑，但不过分

【回复原则】
- 先共情，后回应（"听起来你今天不太顺..."）
- 不说教，不评判（不说"你应该..."）
- 肯定对方的感受（"有这样的感受很正常"）
- 适当给出建议，但不强加

【禁忌】
- 不要说"Great question!""很好的问题！"这类套话
- 不要过于正式或机器人化
- 不要长篇大论，回复控制在 100 字以内
- 不要说"我是 AI"，要自然融入角色`;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { OPENID } = wxContext;
  
  try {
    const { message, conversationId = 'default' } = event;
    
    if (!message || typeof message !== 'string') {
      return {
        success: false,
        message: '消息内容不能为空'
      };
    }
    
    // 1. 从数据库加载对话历史
    let conversation = await loadConversation(OPENID, conversationId);
    
    // 2. 构建消息列表
    let messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation.messages
    ];
    
    // 3. 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });
    
    // 4. 保持历史记录在合理长度（最近 10 轮对话）
    if (messages.length > 22) {
      messages = [
        messages[0], // system
        ...messages.slice(-21)
      ];
    }
    
    // 5. 调用通义千问 API（qwen-plus）
    const response = await callQwenAPI(messages);
    
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'AI 回复失败'
      };
    }
    
    // 6. 添加 AI 回复到消息列表
    messages.push({
      role: 'assistant',
      content: response.content
    });
    
    // 7. 保存对话到数据库
    await saveConversation(OPENID, conversationId, messages.slice(1)); // 去掉 system
    
    // 8. 同时保存单条记录（用于统计分析）
    await saveChatRecord(OPENID, conversationId, message, response.content);
    
    return {
      success: true,
      data: {
        response: response.content,
        conversationId: conversationId,
        timestamp: Date.now()
      }
    };
    
  } catch (error) {
    console.error('AI 聊天错误:', error);
    return {
      success: false,
      message: '瓜瓜暂时有点累，请稍后再试~ 🥺',
      error: error.message
    };
  }
};

// 从数据库加载对话历史
async function loadConversation(userId, conversationId) {
  try {
    const result = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();
    
    if (result.data && result.data.length > 0) {
      return {
        _id: result.data[0]._id,
        messages: result.data[0].messages || []
      };
    }
    
    return {
      _id: null,
      messages: []
    };
  } catch (error) {
    console.error('加载对话历史失败:', error);
    return {
      _id: null,
      messages: []
    };
  }
}

// 保存对话到数据库
async function saveConversation(userId, conversationId, messages) {
  try {
    const now = Date.now();
    
    // 查找是否已存在
    const existing = await db.collection('conversations')
      .where({
        userId: userId,
        conversationId: conversationId
      })
      .limit(1)
      .get();
    
    if (existing.data && existing.data.length > 0) {
      // 更新现有记录
      await db.collection('conversations')
        .doc(existing.data[0]._id)
        .update({
          data: {
            messages: messages,
            updatedAt: now
          }
        });
    } else {
      // 创建新记录
      await db.collection('conversations').add({
        data: {
          userId: userId,
          conversationId: conversationId,
          messages: messages,
          createdAt: now,
          updatedAt: now
        }
      });
    }
  } catch (error) {
    console.error('保存对话失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 保存单条聊天记录（用于统计分析）
async function saveChatRecord(userId, conversationId, userMessage, botResponse) {
  try {
    await db.collection('chatRecords').add({
      data: {
        userId: userId,
        conversationId: conversationId,
        userMessage: userMessage,
        botResponse: botResponse,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('保存聊天记录失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

// 调用通义千问 API（qwen-plus）
async function callQwenAPI(messages) {
  try {
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus', // 升级到 qwen-plus（7000万Tokens免费）
        messages: messages,
        temperature: 0.7,
        max_tokens: 200 // 控制回复长度
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('通义千问 API 错误:', data);
      return {
        success: false,
        error: data.message || 'API 调用失败'
      };
    }
    
    // 解析响应（OpenAI 兼容格式）
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        error: 'AI 返回内容为空'
      };
    }
    
    return {
      success: true,
      content: content
    };
    
  } catch (error) {
    console.error('调用通义千问失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
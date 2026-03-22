// 云函数：语音合成（TTS）
// 使用阿里云语音合成 API
const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 阿里云语音合成 API（需要配置）
// 注意：这里使用的是模拟实现，实际需要申请阿里云语音服务
const TTS_API_URL = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts';

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  
  try {
    const { text, voice = 'zhichu' } = event;
    
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        message: '文本内容不能为空'
      };
    }
    
    // 限制文本长度（语音合成通常有字数限制）
    if (text.length > 500) {
      return {
        success: false,
        message: '文本太长了，请控制在 500 字以内~'
      };
    }
    
    console.log('语音合成，文本:', text.substring(0, 50) + '...');
    
    // 由于阿里云语音合成需要单独申请，这里提供一个简化的实现
    // 实际使用时需要申请 AccessKey
    
    // 方案 1：使用阿里云语音服务（需要 AccessKey）
    // const result = await callAliyunTTS(text, voice);
    
    // 方案 2：使用微信小程序自带的语音合成插件（推荐）
    // 前端直接调用 wx.createInnerAudioContext 播放
    
    // 方案 3：返回提示信息（临时方案）
    return {
      success: false,
      message: '语音功能正在开发中，敬请期待~ 🔊',
      note: '需要申请阿里云语音服务或使用微信小程序插件',
      text: text
    };
    
  } catch (error) {
    console.error('语音合成错误:', error);
    return {
      success: false,
      message: '语音合成失败，请稍后再试~',
      error: error.message
    };
  }
};

// 调用阿里云语音合成 API（需要 AccessKey）
async function callAliyunTTS(text, voice) {
  // 需要申请阿里云 AccessKey
  // 文档：https://help.aliyun.com/document_detail/84435.html
  
  try {
    const response = await fetch(TTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        voice: voice, // zhichu(温暖女声), aixia(温柔女声), aijia(知性女声)
        format: 'mp3',
        sample_rate: 16000,
        volume: 50,
        speech_rate: 0
      })
    });
    
    if (!response.ok) {
      throw new Error('TTS API 调用失败');
    }
    
    // 返回音频数据或 URL
    const audioBuffer = await response.arrayBuffer();
    
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `tts/${Date.now()}.mp3`,
      fileContent: Buffer.from(audioBuffer)
    });
    
    return {
      success: true,
      audioUrl: uploadResult.fileID
    };
    
  } catch (error) {
    console.error('阿里云 TTS 调用失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
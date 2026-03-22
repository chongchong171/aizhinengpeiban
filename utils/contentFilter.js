/**
 * 内容过滤器工具
 * @description 检查内容是否包含敏感词，确保内容安全
 * @author 玄枢
 * @date 2026-03-15
 */

// 敏感词库（示例，实际使用需要从服务器获取或扩展）
const sensitiveWords = [
  // 政治敏感
  '敏感词 1',
  '敏感词 2',
  
  // 色情低俗
  '色情',
  '低俗',
  
  // 暴力恐怖
  '暴力',
  '恐怖',
  
  // 广告营销
  '加微信',
  'QQ 群',
  '微信号',
  '公众号',
  '刷单',
  '兼职',
  
  // 不文明用语
  '傻逼',
  '操',
  '他妈'
];

/**
 * 检查内容是否包含敏感词
 * @param {string} content 待检查的内容
 * @returns {Object} { passed: boolean, message: string }
 */
function checkContent(content) {
  if (!content || typeof content !== 'string') {
    return {
      passed: false,
      message: '内容不能为空'
    };
  }

  // 转换为小写进行检查（不区分大小写）
  const lowerContent = content.toLowerCase();

  // 检查敏感词
  for (const word of sensitiveWords) {
    if (lowerContent.includes(word.toLowerCase())) {
      return {
        passed: false,
        message: '内容包含不当词汇，请修改后重试'
      };
    }
  }

  // 检查特殊字符（过多的表情符号或特殊符号）
  const specialCharCount = (content.match(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > content.length * 0.3) {
    return {
      passed: false,
      message: '内容包含过多特殊字符'
    };
  }

  // 通过检查
  return {
    passed: true,
    message: '内容合规'
  };
}

/**
 * 清理内容（去除首尾空格和多余空白）
 * @param {string} content 原始内容
 * @returns {string} 清理后的内容
 */
function cleanContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // 去除首尾空格
  let cleaned = content.trim();
  
  // 将多个连续空白字符替换为单个空格
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned;
}

module.exports = {
  checkContent,
  cleanContent
};

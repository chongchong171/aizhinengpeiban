/**
 * AI 名字管理工具
 * @description 全局名字读取、保存、重置功能
 * @author 玄枢
 * @date 2026-03-15
 */

/**
 * 默认 AI 名字
 */
const DEFAULT_AI_NAME = '瓜瓜';

/**
 * 存储键名
 */
const STORAGE_KEY = 'aiName';

/**
 * 获取 AI 名字
 * @returns {string} AI 名字，如果没有设置则返回默认名字
 */
function getName() {
  try {
    const name = wx.getStorageSync(STORAGE_KEY);
    return name || DEFAULT_AI_NAME;
  } catch (error) {
    console.error('读取 AI 名字失败:', error);
    return DEFAULT_AI_NAME;
  }
}

/**
 * 保存 AI 名字
 * @param {string} name - 要保存的名字
 * @returns {boolean} 是否保存成功
 */
function setName(name) {
  try {
    if (!name || typeof name !== 'string') {
      console.error('名字格式不正确:', name);
      return false;
    }
    
    // 去除首尾空格
    const trimmedName = name.trim();
    
    // 验证长度
    if (trimmedName.length < 2 || trimmedName.length > 4) {
      console.error('名字长度应在 2-4 个字之间');
      return false;
    }
    
    wx.setStorageSync(STORAGE_KEY, trimmedName);
    console.log('AI 名字已保存:', trimmedName);
    return true;
  } catch (error) {
    console.error('保存 AI 名字失败:', error);
    return false;
  }
}

/**
 * 重置 AI 名字为默认值
 * @returns {boolean} 是否重置成功
 */
function resetName() {
  try {
    wx.removeStorageSync(STORAGE_KEY);
    console.log('AI 名字已重置为默认值:', DEFAULT_AI_NAME);
    return true;
  } catch (error) {
    console.error('重置 AI 名字失败:', error);
    return false;
  }
}

/**
 * 检查是否已设置名字
 * @returns {boolean} 是否已设置
 */
function hasName() {
  try {
    const name = wx.getStorageSync(STORAGE_KEY);
    return !!name;
  } catch (error) {
    console.error('检查 AI 名字状态失败:', error);
    return false;
  }
}

// 导出所有方法
module.exports = {
  getName,
  setName,
  resetName,
  hasName,
  DEFAULT_AI_NAME
};

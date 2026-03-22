/**
 * 错误处理工具类
 * @description 提供统一的错误处理和用户提示功能
 * @author 玄枢
 * @date 2026-03-16
 */

/**
 * 显示错误提示
 * @param {string} message - 错误信息
 * @param {string} context - 错误发生的上下文
 */
const showError = (message, context = '') => {
  // 记录错误日志
  if (context) {
    console.error(`${context}错误:`, message);
  } else {
    console.error('错误:', message);
  }

  // 显示用户友好的提示
  wx.showToast({
    title: message || '操作失败，请稍后重试',
    icon: 'none',
    duration: 2000
  });
};

/**
 * 显示成功提示
 * @param {string} message - 成功信息
 */
const showSuccess = (message) => {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 1500
  });
};

/**
 * 显示警告提示
 * @param {string} message - 警告信息
 */
const showWarning = (message) => {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
};

/**
 * 处理云函数调用错误
 * @param {object} error - 错误对象
 * @param {string} functionName - 云函数名称
 */
const handleCloudError = (error, functionName) => {
  console.error(`云函数 ${functionName} 调用失败:`, error);

  let message = '操作失败，请稍后重试';

  if (error && error.errMsg) {
    if (error.errMsg.includes('timeout')) {
      message = '请求超时，请检查网络连接';
    } else if (error.errMsg.includes('network')) {
      message = '网络错误，请检查网络连接';
    }
  }

  showError(message, `云函数${functionName}`);
  return message;
};

module.exports = {
  showError,
  showSuccess,
  showWarning,
  handleCloudError
};

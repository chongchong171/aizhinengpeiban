const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
exports.main = async (event, context) => {
  const { fileList } = event
  try {
    const result = await cloud.getTempFileURL({ fileList })
    return { success: true, fileList: result.fileList }
  } catch (err) {
    return { success: false, error: err }
  }
}
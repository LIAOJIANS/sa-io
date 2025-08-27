const boom = require('boom')
const { validationResult } = require('express-validator')
const Result = require('./result')

const path = require('path')

const { 
  getFileContentByName,
  setFileContentByName,
  rmdirRecursive,
  download,
  compressed,
  copyFile,
  rmFile,
  zipFilePipe,
  hasDirectory
} = require('./handleFile')

const {
  gitPro,
  shellPro,
  buildPro,
  installPro,
  installAfterBuildPro,
  gitPullPro,
  gitCheckoutPro,
  gitReset,
  rmDir,
  rmRf,
  wsPro,

  handleProcess
} = require('./processFlow')

function checkBeforRes(
  next, 
  req,
  handleRes
) {

  const err = validationResult(req)

  if(!err.isEmpty()) {
    const [{ msg }] = err.errors
    next(boom.badRequest(msg))
  } else {
    handleRes?.()
  }
}

// function getClientIP(req) {

//   return req.headers['x-forwarded-for'] || 
//       req.connection.remoteAddress || 
//       req.socket.remoteAddress ||
//       req.connection.socket.remoteAddress;
// }

function setTempPublishConfig(opt) {
  const tempPath = path.resolve(__dirname, '../temp/publish.temp.json')

  setFileContentByName(
    'publish.temp.json', 
    opt,
    true, 
    tempPath
  ) // 写入临时配置

  const rmTempByName = () => { // 无论成败删除临时推送配置
    rmFile(
      'publish.temp.json', 
      tempPath
    )
  }

  handleProcess({
    proName: 'node',
    pro: ['./publish.js'],
    option: {
      cwd: path.resolve(__dirname, '../utils'),
    },
    filePath: path.resolve(__dirname, `../log/${opt.projectName}.log`),
  })
  .then(rmTempByName)
  .catch(rmTempByName)

}

module.exports = {
  checkBeforRes,
  getFileContentByName,
  setFileContentByName,
  rmdirRecursive,
  download,
  compressed,
  copyFile,
  rmFile,
  gitReset,
  hasDirectory,
  zipFilePipe,
  
  gitPullPro,
  gitPro,
  shellPro,
  buildPro,
  installPro,
  installAfterBuildPro,
  gitCheckoutPro,
  rmDir,
  rmRf,
  wsPro,

  setTempPublishConfig,

  Result
}

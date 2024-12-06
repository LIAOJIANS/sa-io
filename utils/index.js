const boom = require('boom')
const { validationResult } = require('express-validator')
const Result = require('./result')

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
  rmRf
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
  
  gitPullPro,
  gitPro,
  shellPro,
  buildPro,
  installPro,
  installAfterBuildPro,
  gitCheckoutPro,
  rmDir,
  rmRf,
  zipFilePipe,

  Result
}

const boom = require('boom')
const { validationResult } = require('express-validator')
const Result = require('./result')

const { 
  getJsonDataByName,
  setJsonDataByName,
  rmdirRecursive
} = require('./handleJsonFile')

const {
  gitPro,
  shellPro
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
  getJsonDataByName,
  setJsonDataByName,
  rmdirRecursive,

  gitPro,
  shellPro,

  Result
}

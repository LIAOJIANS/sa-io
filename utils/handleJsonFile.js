const fs = require('fs')
const path = require('path')

const baseUrl = path.resolve(__dirname, '../data')

const pathSplicing = fileName => `${baseUrl}/${fileName}.json`

function getJsonDataByName(
  fileName
) {

  const filePath = pathSplicing(fileName)

  if (fs.existsSync(filePath)) {

    fs.writeFileSync(
      filePath,
      '{}'
    )

    return {}
  }

  const data = fs.readFileSync(
    filePath,
    'utf-8'
  )

  return JSON.parse(data)
}

function setJsonDataByName(
  fileName,
  data,
  isCover
) {

  const filePath = pathSplicing(fileName)

  fs[
    isCover ?
      'writeFileSync' :
      'appendFileSync'
  ](
    filePath,
    JSON.stringify(data),
    'utf-8'
  )
}

module.exports = {
  getJsonDataByName,
  setJsonDataByName
}
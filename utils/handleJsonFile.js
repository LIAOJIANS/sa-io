const fs = require('fs')
const path = require('path')

const baseUrl = path.resolve(__dirname, '../data')

const pathSplicing = fileName => `${baseUrl}/${fileName}.json`

function getJsonDataByName(
  fileName,
  defalut = {}
) {

  const filePath = pathSplicing(fileName)

  if (!fs.existsSync(filePath)) {

    fs.writeFileSync(
      filePath,
      JSON.stringify(defalut)
    )

    return defalut
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

function rmdirRecursive(projectName) {

  const dirPath = path.resolve(__dirname, `../project/${projectName}`)

  // const entries = fs.readFileSync(dirPath, { withFileTypes: true });  
  
  // for (const entry of entries) {  
  //   const fullPath = path.join(dirPath, entry.name);  
  
  //   if (entry.isDirectory()) {  
  //      rmdirRecursive(fullPath);  
  //   } else {  
  //      fs.unlinkSync(fullPath);  
  //   }  
  // }  
  
  fs.rmSync(dirPath, { recursive: true, force: true });  

}  

module.exports = {
  getJsonDataByName,
  setJsonDataByName,
  rmdirRecursive
}
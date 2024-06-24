const fs = require('fs')
const path = require('path')

const baseUrl = path.resolve(__dirname, '../data')

const pathSplicing = fileName => `${baseUrl}/${fileName}.json`

function getFileContentByName(
  fileName,
  defalut = {},
  path = ''
) {

  const filePath = pathSplicing(path || fileName)

  const typeofData = data => (typeof data === 'string')()

  if (!fs.existsSync(filePath)) {

    fs.writeFileSync(
      filePath,
      typeofData(defalut) ? defalut : JSON.stringify(defalut)
    )

    return defalut
  }

  const data = fs.readFileSync(
    filePath,
    'utf-8'
  )

  return typeofData(data) ? data : JSON.parse(data)
}

function setFileContentByName(
  fileName,
  data,
  isCover,
  path = ''
) {

  const filePath = pathSplicing(path || fileName)

  fs[
    isCover ?
      'writeFileSync' :
      'appendFileSync'
  ](
    filePath,
    typeof data === 'string' ? data : JSON.stringify(data),
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
  getFileContentByName,
  setFileContentByName,
  rmdirRecursive
}
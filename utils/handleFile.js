const fs = require('fs')
const path = require('path')
const archiverFun = require('archiver')

const baseUrl = path.resolve(__dirname, '../data')

const pathSplicing = fileName => `${baseUrl}/${fileName}.json`

function getFileContentByName(
  fileName,
  defalut = {},
  onterPath = ''
) {

  const filePath = onterPath || pathSplicing(fileName)

  const typeofData = data => (typeof data === 'string')

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
  
  try {
    return JSON.parse(data)
  } catch (error) {
    return data
  }
}

function setFileContentByName(
  fileName,
  data,
  isCover,
  onterPath = ''
) {

  const filePath = onterPath || pathSplicing(fileName)

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

  const entries = fs.readFileSync(dirPath, { withFileTypes: true });  
  
  for (const entry of entries) {  
    const fullPath = path.join(dirPath, entry.name);  
  
    if (entry.isDirectory()) {  
       rmdirRecursive(fullPath);  
    } else {  
       fs.unlinkSync(fullPath)
    }  
  }  
  
  // fs.rmSync(dirPath, { recursive: true, force: true });   // 低版本node不支持

}

function rmFile(projectName) {
  const fullPath = path.resolve(__dirname, `../project/${projectName}`)
  
  fs.unlinkSync(fullPath)
}

function download(success, error, path) {
  try {
    const stream = fs.createReadStream(path)
    success?.(stream)
  } catch(err) {
    error?.()
  }
}

function compressed(projectName, formProjectName) {
  console.log('打包成功！')
  const archiver = archiverFun('zip', {
    zlib: { level: 9 }
  })

  const output = fs.createWriteStream(path.resolve(__dirname, `../builds/${projectName}.zip`))

  archiver.on('warning', (err) => {  
    if (err.code === 'ENOENT') {  
      console.warn(err) 
    } else {  
      throw err
    }  
  }) 

  archiver.on('error', (err) => {  
    throw err
  })

  archiver.pipe(output)

  archiver.directory(path.resolve(__dirname, `../project/${formProjectName}/dist`), false)
  
  archiver.finalize()
}

function copyFile(from, to) {
  fs.mkdirSync(to, { recursive: true });
  
  fs.readdirSync(from).forEach(file => {  
    const srcFile = path.join(from, file);  
    const destFile = path.join(to, file);  
  
    fs.statSync(srcFile).isDirectory() ?   
      copyFile(srcFile, destFile) :  
      fs.copyFileSync(srcFile, destFile)
      
  })
}

module.exports = {
  getFileContentByName,
  setFileContentByName,
  rmdirRecursive,
  download,
  compressed,
  copyFile,
  rmFile
}
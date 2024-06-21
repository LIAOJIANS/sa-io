const { spawn } = require('child_process')
const path = require('path')

const targetName = () => gitUrl.match(/(\/[^\/]+)\.git$/)[1]

const cloneDir = (
  projectName,
  dir = 'project'
) => path.join(__dirname, `../${dir}/${projectName}`)

function handleProcess(
  proName,
  pro, 
  option = {}
) {
  return new Promise((reslove, reject) => {
    const process = spawn(proName, pro, option)

    /* 怎么按顺序全局收集日志信息？ */
    process.stdout.on('data', (data) => {
      console.log(`${data}`);  
    });  
      
    process.stderr.on('data', (data) => {  
      console.error(`${data}`);  
    });  
    
    process.on('close', (code) => {
      if(code === 0) {
        reslove()
      }
    });
  })
}

function gitPro(
  targetUrl,
  projectName
) {
  return handleProcess(
    'git',
    ['clone', targetUrl, cloneDir(projectName)]
  )
}

function shellPro(
  projectName
) {
  return handleProcess(
    'sh',
    [cloneDir(projectName, 'sh')]
  )
}

module.exports = {
  gitPro,
  shellPro
}
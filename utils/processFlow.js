const { spawn } = require('child_process')
const path = require('path')
const { setFileContentByName } = require('./handleFile')

const cloneDir = (
  projectName,
  dir = 'project'
) => path.join(__dirname, `../${dir}/${projectName}`)

function handleProcess(
  {
    proName,
    pro, 
    option = {},
    filePath
  }
) {
  return new Promise((reslove, reject) => {
    const process = spawn(proName, pro, option)

    let log = ''

    /* 怎么按顺序全局收集日志信息？ */
    process.stdout.on('data', (data) => {
      console.log(`${data}`);  
      log += data
    });  
      
    process.stderr.on('data', (data) => {  
      console.error(`${data}`);  
      log += data
    });  
    
    process.on('close', (code) => {
      code === 0 ? reslove() : reject()

      // 写入日志，并开启sse单项通信推送日志
      if(proName !== 'git') {
        setFileContentByName(
          '',
          log,
          true,
          filePath
        )
      }
    });
  })
}

function gitPro(
  targetUrl,
  projectName
) {
  return handleProcess({
    proName: 'git',
    pro: ['clone', targetUrl, cloneDir(projectName)]
  })
}

function shellPro(
  projectName,
  filePath
) {
  return handleProcess(
    {
      proName: 'sh',
      pro: [cloneDir(`${projectName}/build.sh`)],
      filePath
    }
  )
}

function buildPro(projectName, filePath) {
  return handleProcess(
    {
      proName: 'npm',
      pro: ['run', 'build'],
      option: {  
        cwd: cloneDir(`${projectName}/build.sh`),
      },
      filePath
    }
  )
}

function installPro(projectName, filePath) {
  return handleProcess(
    {
      proName: 'npm',
      pro: ['install'],
      option: {  
        cwd: cloneDir(`${projectName}/build.sh`),
      },
      filePath
    }
  )
}

function installAfterBuildPro(projectName, filePath) {
  return new Promise(async (reslove, reject) => {
    try {
      await installPro(projectName, filePath)
    } catch(e) {
      reject()
    }

    buildPro(projectName, filePath)
      .then(reslove)
      .catch(reject)
  })
}

module.exports = {
  gitPro,
  shellPro,
  cloneDir,
  buildPro,
  installPro,
  installAfterBuildPro
}
const { spawn } = require('child_process')
const path = require('path')
const { setFileContentByName } = require('./handleFile')
const os = require('os')

const platform = () => os.platform() === 'win32'

const cloneDir = (
  projectName,
  dir = 'project'
) => path.join(__dirname, `../${dir}/${projectName}`)

function handleProcess(
  {
    proName,
    pro, 
    option = {},
    filePath,
    setLog = true
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

      code == 0 ? reslove() : reject()

      // 写入日志，并开启sse单项通信推送日志
      if(setLog) {
        setFileContentByName(
          '',
          log,
          false,
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
    pro: ['clone', targetUrl, cloneDir(projectName)],
    setLog: false
  })
}

function shellPro(
  projectName,
  filePath
) {
  return handleProcess(
    {
      proName: 'sh',
      pro: ['./build.sh'],
      option: {  
        cwd: cloneDir(`${projectName}`),
      },
      filePath
    }
  )
}

function buildPro(projectName, filePath) {
  return handleProcess(
    {
      proName: `npm${platform() ? '.cmd' : ''}`,
      pro: ['run', 'build'],
      option: {  
        cwd: cloneDir(`${projectName}`),
      },
      filePath
    }
  )
}

function installPro(projectName, filePath) {
  return handleProcess(
    {
      proName: `npm${platform() ? '.cmd' : ''}`,
      pro: ['install'],
      option: {  
        cwd: cloneDir(projectName),
      },
      filePath
    }
  )
}

function installAfterBuildPro(projectName, filePath) {
  return new Promise(async (reslove, reject) => {
    try {
      await installPro(projectName, filePath)

      buildPro(projectName, filePath)
        .then(reslove)
        .catch(reject)
    } catch(e) {
      reject()
    }
  })
}

function gitPullPro(projectName) {
  return handleProcess({
    proName: 'git',
    pro: ['pull'],
    option: {
      cwd: cloneDir(projectName)
    }
  })
}

function gitCheckoutPro(projectName, branch) {
  return new Promise(async (reslove, reject) => {
    try {
      await handleProcess({
        proName: 'git',
        pro: ['checkout', branch],
        option: {
          cwd: cloneDir(projectName)
        }
      })

      gitPullPro(projectName)
        .then(() => reslove())
        .catch(() => reject())
    } catch(e) {
      reject()
    }
  })
}

module.exports = {
  gitPro,
  shellPro,
  cloneDir,
  buildPro,
  installPro,
  installAfterBuildPro,
  gitPullPro,
  gitCheckoutPro
}
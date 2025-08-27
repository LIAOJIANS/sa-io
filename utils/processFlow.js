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
    setLog = true,
    isCover = false
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

      code == 0 ? reslove(log) : reject()

      // 写入日志，并开启sse单项通信推送日志
      if(setLog) {
        setFileContentByName(
          '',
          log,
          isCover,
          filePath
        )
      }
    });
  })
}

function gitPro(
  targetUrl,
  projectName,
  dir = 'project'
) {
  return handleProcess({
    proName: 'git',
    pro: ['clone', targetUrl, cloneDir(projectName, dir)],
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

function buildPro(projectName, filePath, dir = 'project') {
  return handleProcess(
    {
      proName: `npm${platform() ? '.cmd' : ''}`,
      pro: ['run', 'build'],
      option: {  
        cwd: cloneDir(`${projectName}`, dir),
      },
      filePath
    }
  )
}

function installPro(projectName, filePath, dir = 'project') {
  return handleProcess(
    {
      proName: `npm${platform() ? '.cmd' : ''}`,
      pro: ['install'],
      option: {  
        cwd: cloneDir(projectName, dir),
      },
      filePath
    }
  )
}

function installAfterBuildPro(projectName, filePath, dir = 'project') {
  return new Promise(async (reslove, reject) => {
    try {
      await installPro(projectName, filePath, dir)

      buildPro(projectName, filePath, dir)
        .then(reslove)
        .catch(reject)
    } catch(e) {
      reject()
    }
  })
}

function gitPullPro(projectName, filePath) {
  return handleProcess({
    proName: 'git',
    pro: ['pull', '--verbos'],
    option: {
      cwd: cloneDir(projectName)
    },
    filePath
  })
}

function gitReset(
  projectName, 
  commitId, 
  dir = 'project'
) {
  return new Promise(async (reslove, reject) => {
    try {
      await handleProcess({
        proName: 'git',
        pro: ['reset', commitId],
        option: {
          cwd: cloneDir(projectName, dir)
        }
      })
      reslove()
    } catch(e) {
      reject()
    }
  })
}

function gitCheckoutPro(
  projectName, 
  branch,
  dir = 'project',
  reset = false,
  commitId = ''
) {
  return new Promise(async (reslove, reject) => {
    try {
      await handleProcess({
        proName: 'git',
        pro: ['checkout', branch],
        option: {
          cwd: cloneDir(projectName, dir)
        }
      })

     if(reset) {
      gitReset(projectName, commitId, dir)
      .then(() => reslove())
      .catch(() => reject())
     } else {
      gitPullPro(projectName)
      .then(() => reslove())
      .catch(() => reject())
     }

    } catch(e) {
      reject()
    }
  })
}

function rmDir(projectName, reName) {

  return handleProcess({
    proName: 'rm',
    pro: ['-rf', reName],
    option: {
      cwd: cloneDir(projectName)
    }
  })
}

function rmRf(reName, projectName) {

  return handleProcess({
    proName: 'rm',
    pro: ['-rf', projectName],
    option: {
      cwd: path.resolve(__dirname, `../${reName}`)
    }
  })
}

function wsPro(proName, projectName) {
  return handleProcess({
    proName,
    pro: [],
    option: { 
      shell: true,
      cwd: path.resolve(__dirname, `../project/${projectName}`)
    },
    filePath: path.resolve(__dirname, `../log/ws/${projectName}.log`),
    isCover: true
  })
}

module.exports = {
  gitPro,
  shellPro,
  cloneDir,
  buildPro,
  gitReset,
  installPro,
  installAfterBuildPro,
  gitPullPro,
  gitCheckoutPro,
  rmDir,
  rmRf,
  wsPro,

  handleProcess,
}
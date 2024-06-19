const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const token = 'WCsVjU_QB7UszJVnw6nY'
const usename = 'liaojs'
  
// 注意：直接在 URL 中包含凭据可能会带来安全风险，特别是当这些凭据被记录或暴露时  
// 在生产环境中，您应该考虑使用更安全的方式来处理凭据，例如环境变量或加密的凭据存储  
const gitUrl = `http://${encodeURIComponent(usename)}:${encodeURIComponent(token)}@192.168.1.99/wison/supervise-device-ui.git`

const targetName = () => gitUrl.match(/(\/[^\/]+)\.git$/)[1]

const cloneDir = path.join(__dirname, targetName());

// 判断是否存在当前拉区的文件夹 执行 git remote get-url origin

exports.gitPro = () => new Promise((reslove) => {
  /*
    ['clone', gitUrl, cloneDir] // 克隆
    ['pull', gitUrl] // 拉取
  */
  const handleGitPro = ({
    pro,
    option = {}
  }) => {
    const gitPro = spawn('git', pro, option) // 拉取最新

    gitPro.stdout.on('data', (data) => {  
      console.log(`${data}`);  
    });  
      
    gitPro.stderr.on('data', (data) => {  
      console.error(`${data}`);  
    });  
    
    gitPro.on('close', (code) => {
      if(code === 0) {
        reslove({
          cloneDir
        })
      }
    });
  }

  console.log(fs.existsSync(cloneDir))

  handleGitPro(
    fs.existsSync(cloneDir) ? 
      { pro: ['pull'], option: { cwd: cloneDir } } : 
      { pro: ['clone', gitUrl, cloneDir] }
  ) 
})

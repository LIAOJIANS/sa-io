const client = require('scp2')
// const ora = require('ora')
const Client = require('ssh2').Client

function publishTragetServer({
  pubTargetIp,
  pubTargetProt,
  pubTargetDir,
  pubTargetUser,
  pubTargetPwd,
  localPath
}, success, error) {

  // const spinner = ora('publishing server!')
  const conn = new Client()

  console.log('establishing connection~')

  conn.on('ready', () => {
    console.log('connection~~')
    if (!pubTargetDir) {
      console.log('close connection!')
      conn.end()

      return false
    }

    conn.exec('rm -rf' + pubTargetDir + '/*', function (err, stream) {
      console.log(err + 'rm file')
      stream.on('close', (code, signal) => {
        console.log('start publish')
        // spinner.start()
        client.scp(localPath, {
          host: pubTargetIp,
          port: pubTargetProt,
          username: pubTargetUser,
          password: pubTargetPwd,
          path: pubTargetDir
        }, err => {
          // spinner.stop()
          if (!err) {
            success?.()
          } else {
            error?.()
          }
          conn.end()
        })
      })
    })
  }).connect({
    host: pubTargetIp,
    port: pubTargetProt,
    username: pubTargetUser,
    password: pubTargetPwd
    // privateKey: '' // 私秘钥
  })
}


module.exports = publishTragetServer
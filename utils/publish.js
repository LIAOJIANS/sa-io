const Client = require('ssh2').Client

const path = require('path')
const fs = require('fs');
const { getFileContentByName } = require('./handleFile')

const start = process.hrtime()

let filePaths = []

function recursiveUpload(
  localFolderPath,
  remoteFolderPath,
  sftp
) {
  return new Promise((resolve, reject) => {
    try {

      const files = fs.readdirSync(localFolderPath)
      sftp.mkdir(remoteFolderPath, async (err) => {

        const uploadPromises = []

        for (let i = 0; i < files.length; i++) {

          let localFilePath = path.join(localFolderPath, files[i])
          let stats = fs.statSync(localFilePath)
          let remoteFilePath = `${remoteFolderPath}/${files[i]}`

          if (stats.isDirectory()) {

            const subPromise = recursiveUpload(localFilePath, remoteFilePath, sftp);
            uploadPromises.push(subPromise);

          } else {

            filePaths.push({
              localFilePath,
              remoteFilePath
            })

          }
        }

        await Promise.all(uploadPromises) // 等待所有子任务收集完成

        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

function recursiveDelete(
  sftp,
  remoteFolderPath,
  callback
) {
  sftp.stat(remoteFolderPath, (err, stats) => {

    if (err) {
      return callback(err.code === 'ENOENT' ? null : err)
    }

    if (stats.isDirectory()) {
      sftp.readdir(remoteFolderPath, (err, files) => {

        if (err) {
          return callback(err)
        }

        let deleteCount = 0;
        for (let i = 0; i < files.length; i++) {

          let filePath = `${remoteFolderPath}/${files[i].filename}`

          recursiveDelete(
            sftp,
            filePath,
            err => {
              if (err) {
                return callback(err);
              }

              deleteCount++;
              if (deleteCount === files.length) {
                sftp.rmdir(remoteFolderPath, callback)
              }

            })
        }
        if (files.length === 0) {
          sftp.rmdir(remoteFolderPath, callback)
        }

      })
    } else {
      sftp.unlink(remoteFolderPath, callback)
    }
  });
}

function uploadFile(
  filePath, 
  sftp,
  cb
) {
  filePath = filePath || []

  let schedule = 0

  const requestQueue = (concurrency) => {
    concurrency = concurrency || 6
    const queue = [] // 线程池
    let current = 0

    const dequeue = () => {
      while (current < concurrency && queue.length) {
        
        current++
        const requestPromiseFactory = queue.shift()
        requestPromiseFactory()
          .then(() => {

            schedule++ // 收集上传成功的数量

            if(schedule === filePath.length) {
              cb()
            }

          })
          .catch(error => { // 失败
            cb(error)
          })
          .finally(() => {

            current--
          
            dequeue()
            
          });
      }

    }

    return requestPromiseFactory => {
      queue.push(requestPromiseFactory)
      dequeue()
    }

  }

  const enqueue = requestQueue(6)

  for (let i = 0; i < filePath.length; i++) {

    enqueue(
      () => {

        const { localFilePath, remoteFilePath } = filePath[i]

        return new Promise((resolve, reject) => {

          sftp.fastPut(
            localFilePath, 
            remoteFilePath, 
            err => err ? reject(err) : resolve()
          )

        })
      }
    )
  }

  return schedule

}

function publishTragetServer({
  pubTargetIp,
  pubTargetProt,
  pubTargetDir,
  pubTargetUser,
  pubTargetPwd,
  localPath
}, success, error) {

  const conn = new Client()

  console.log('establishing connection~')

  conn.on('ready', () => {
    console.log(`-------------------------------  ${new Date()} --------------------------------`)
    console.log('connection~~', pubTargetIp)

    if (!pubTargetDir) {
      console.log('close connection!')
      conn.end()

      return false
    }
    conn.sftp((err, sftp) => {
      if (err) {
        console.log('Error creating SFTP session:', err)
        return;
      }

      sftp.realpath('.', (err, path) => {
        if (err) {
          console.log('Error getting current path:', err)
        } else {
          console.log('Current working path:', path + pubTargetDir)
        }
      });

      recursiveDelete(sftp, pubTargetDir, async (err) => {
        console.log(err)
        try {
          await recursiveUpload(localPath, pubTargetDir, sftp)

          uploadFile(filePaths, sftp, (err) => {

            if (err) {
              console.log('Error uploading file:', err)

              error?.()
            } else {
              console.log('File uploaded successfully', `put ${localPath} to ${pubTargetDir}`)
              
              success?.()
            }

            conn.end()
          })
        
        } catch (error) {
          console.log(error)
          conn.end()
        }

        setTimeout(() => {
          const end = process.hrtime(start);
          console.log(`Time elapsed: ${end[0] * 1000 + end[1] / 1000000}ms`)
        }, 1000)

      })


    });
  })
    .on('error', (err) => {
      console.error('SSH connection error:', err);
    })
    .connect({
      host: pubTargetIp,
      port: pubTargetProt,
      username: pubTargetUser,
      password: pubTargetPwd
    })
}

(() => {
  const opt = getFileContentByName('publish.temp.json', {}, path.resolve(__dirname, '../temp/publish.temp.json'))

  console.log(opt)

  publishTragetServer(opt)
})()

module.exports = publishTragetServer
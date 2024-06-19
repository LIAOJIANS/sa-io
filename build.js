const { spawn } = require('child_process')


exports.build = (
  cloneDir
) => new Promise((reslove) => {
   // 当 git clone 成功完成后，执行下一个命令（例如 npm install）  
   const npmInstall = spawn('npm', ['run', 'build'], {  
      cwd: cloneDir,
    });  

  npmInstall.stdout.on('data', (data) => {  
    console.log(`${data}`);  
  });  

  npmInstall.stderr.on('data', (data) => {  
    console.error(`${data}`);  
  });  

  npmInstall.on('close', (code, signal) => {  
    if (code === 0) {
      
      console.log('build success !!');  
      reslove()
    } else {  
      console.log('npm build failed');  
    }  
  })
})
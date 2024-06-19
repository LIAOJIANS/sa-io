const { spawn } = require('child_process')

/*
  逻辑一

  需要读取参数判断是否需要intall
  if(install) {
    -判断是否存在node_modules
     -- 如果存在则执行rm -rf node_modules 删除node_mudoles 在执行npm install
    - 如果不存在则执行npm install
  }

  逻辑二

  实时识别是否存在node_modules，当用户勾选先删后install则执行以上逻辑

*/ 

exports.install = (
  cloneDir
) => new Promise((reslove) => {
   // 当 git clone 成功完成后，执行下一个命令（例如 npm install）  
   const npmInstall = spawn('npm', ['install'], {  
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
      
      console.log('install success !!');  
      reslove()
    } else {  
      console.log('npm install failed');  
    }  
  })
})
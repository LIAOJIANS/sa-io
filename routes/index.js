
const express = require('express');
const boom = require('boom')
const { body, query } = require('express-validator');
const os = require('os')
const path = require('path')
const chokidar = require('chokidar')

const {
  getFileContentByName,
  setFileContentByName,
  checkBeforRes,
  rmdirRecursive,
  download,
  compressed,
  copyFile,
  rmFile,
  zipFilePipe,
  hasDirectory,

  gitPro,
  installAfterBuildPro,
  buildPro,
  gitCheckoutPro,
  shellPro,
  gitPullPro,
  rmDir,
  rmRf,

  setTempPublishConfig,

  Result,
} = require('../utils');

// const publishTragetServer = require('../utils/publish')

const router = express.Router()

router.get('/get_git_token', (req, res, next) => {
  checkBeforRes(next, req, () => {
    const gitInfo = getFileContentByName('gitToken');

    new Result(gitInfo).success(res);
  });
});

router.post(
  '/set_git_token',
  [
    (() =>
      ['username', 'token'].map((fild) =>
        body(fild)
          .notEmpty()
          .withMessage('username or token is null'),
      ))(),
  ],
  (req, res, next) => {
    checkBeforRes(next, req, () => {
      const data = req.body;

      setFileContentByName('gitToken', data, true);

      new Result(null, 'success!!!').success(res);
    });
  },
);

router.post(
  '/create_build_project',
  [
    body('projectName')
      .notEmpty()
      .withMessage('projectName is null!'),
    body('targetUrl')
      .isURL()
      .withMessage('targetUrl is null or incorrect format!!')
  ],
  (req, res, next) => {
    checkBeforRes(next, req, () => {
      const { targetUrl, projectName, useToken, branch } = req.body

      const { username, token } = getFileContentByName('gitToken')

      const data = getFileContentByName('projects', [])

      if (data.some(p => p.projectName == projectName)) {
        return new Result(null, 'has project!').fail(res)
      }

      const [http, addr] = targetUrl.split('//')

      const gitTargetUrl = !(token && username) || !useToken ?
        targetUrl :
        `${http}//${encodeURIComponent(username)}:${encodeURIComponent(token)}@${addr}`

      // 根据projectName执行git工作流
      gitPro(
        gitTargetUrl,
        projectName
      ).then(async () => {

        if(branch) {
          try {
            await gitCheckoutPro(projectName, branch)
          } catch(e) {
            console.log(e)
          }
        }

        const data = getFileContentByName('projects', [])

        setFileContentByName('projects',
          [
            ...data,
            {
              ...req.body,
              install: true,
              branch,
              shell: false,
              branch: 'default',
              createTime: Date.now(),
            }
          ],

          true
        )

        new Result(null, 'create success!!').success(res)
      })
        .catch(() => new Result(null, 'error!').fail(res))
    });
  });

router.get('/get_projects', (req, res, next) => {
  checkBeforRes(next, req, () => {
    const data = getFileContentByName('projects', [])

    new Result(data).success(res)
  })
})

router.delete(
  '/delete_project',
  [
    query('projectName')
      .notEmpty()
      .withMessage('projectName is null!')
  ],
  (req, res, next) => {
    checkBeforRes(next, req, () => {
      const { projectName } = req.query

      if (os.platform() === 'linux') { // 如果是linux系统执行rm -rf， 删除速度快

        rmRf('project', projectName) // rm -rf 太危险，考虑换node的rm方法
      } else { // 其他系统则用fs.rm删除，稍慢

        rmdirRecursive(projectName)
      }

      const data = getFileContentByName('projects', [])

      setFileContentByName(
        'projects',
        data.filter(p => p.projectName !== projectName),
        true
      )

      new Result(null, 'delete success!!').success(res)

    })
  }
)

router.post('/get_shell_content', [
  query('projectName').notEmpty().withMessage('projectName is null!!!')
], (req, res, next) => {
  checkBeforRes(next, res, () => {
    const { projectName } = req.query

    const shellContent = getFileContentByName(
      projectName,
      '',
      path.resolve(__dirname, `../project/${projectName}/build.sh`)
    )

    new Result(shellContent).success(res)
  })
})

router.post('/build', [
  (() =>
    ['shell', 'install', 'projectName'].map((fild) =>
      body(fild)
        .notEmpty()
        .withMessage('username or token is null'),
    ))(),
], (req, res, next) => {

  /** 改版，把打包任务写入默认队列：默认打包并发为 simuCount，同时控制相同打包任务数量为 concurrentCount 配置项  **/

  checkBeforRes(next, req, async () => {

    const {
      shell,
      install,
      removeNm,
      shellContent,
      branch,
      projectName,
      pull,
      ...onter
    } = req.body

    if (os.platform() !== 'linux' && shell) {
      res.status(500).send('Running shell scripts must be in a Linux environment!!!')
    }

    const task = getFileContentByName('task', {})

    const { tasking, simuCount, concurrentCount } = task

    if(tasking.length === simuCount) {
      res.status(500).send(`The maximum number of simultaneous constructions is ${simuCount}`)
    }

    const projectReplace = tasking.reduce((num, item) => (
      item === projectName ? num + 1 : num
    ), 0)

    if(projectReplace >= parseInt(concurrentCount)) {  
      res.status(500).send(`The maximum concurrency for the same task is ${concurrentCount}`)
    }
    
    setFileContentByName(
      'task',
      {
        ...task,
        tasking: [
          ...task.tasking,
          projectName
        ]
      },
      true
    )

    const popTask = () => {
      setFileContentByName(
        'task',
        {
          ...task,
          tasking: (task.tasking || []).filter(c => c !== projectName)
        },
        true
      )
    }

    const curTime = Date.now()
    const id = `${projectName}-${curTime}`
    const fileName = `${id}.log`
    const logPath = path.resolve(__dirname, `../log/${fileName}`)

    let status = 'success'

    const getHistory = () => getFileContentByName('history', [])

    // 生成构建历史
    let data = [
      ...getHistory(),
      {
        id,
        projectName,
        buildTime: curTime,
        status: '',
        branch
      }
    ]

    // 生成日志文件
    getFileContentByName(
      '',
      '',
      logPath
    )

    // 写入history基本信息
    setFileContentByName(
      'history',
      data,
      true
    )

    if (removeNm) {
      await rmDir(projectName, 'node_modules') // 删除node_modules  防止不同分支不同版本的依赖冲突

      rmFile(`${projectName}/package-lock.json`) // 删除安装依赖日志，防止版本缓存
    }

    if (branch) { // 如果有分支，并且分支不能等于当前分支，否则切换分支并拉取最新
      const projects = getFileContentByName('projects')

      const project = projects.find(p => p.projectName === projectName)

      if (project.branch !== branch) {
        try {
          if (install) {

            rmFile(`${projectName}/package-lock.json`) // 删除安装依赖日志，防止版本缓存
          }

          await gitCheckoutPro(projectName, branch)

          setFileContentByName('projects', [
            ...projects.map(p => {
              if (p.projectName === projectName) {
                p.branch = branch
              }

              return p
            })
          ], true)
        } catch (e) {

          console.log(e)
          
          setFileContentByName(
            'history',
            [
              ...data,
              {
                projectName,
                buildTime: curTime,
                status: 'error',
                branch
              }
            ],
            true
          )
          
          popTask()

          res.status(500).send('checkout error!!! Please review the log output!!!!!!')
        }

      } else if (pull) { // 拉取最新
        try {
          await gitPullPro(projectName, logPath)
        } catch (e) {
          popTask()
          res.status(500).send('checkout error!!! Please review the log output!!!!!!')
        }
      }
    }

    new Result(`${id}`, 'building, Please review the log output!!!!!!').success(res)

    const compressedPro = () => {
      status = 'success'
      compressed(`${projectName}-${curTime}`, projectName)

      console.log('success')
      copyFile(
        path.resolve(__dirname, `../project/${projectName}/dist`),
        path.resolve(__dirname, `../builds/${projectName}-${curTime}`)
      )

      const {
        publish,
        ...left
      } = onter

      if (publish) {
        // publishTragetServer({
        //   ...left,
        //   localPath: path.resolve(__dirname, `../builds/${projectName}-${curTime}`)
        // })

        setTempPublishConfig({
          ...left,
          localPath: path.resolve(__dirname, `../builds/${projectName}-${curTime}`),
          projectName: `${projectName}-${curTime}`
        })
      }

      popTask()

    }

    if (shell) { // 执行sh脚本

      setFileContentByName(
        projectName,
        shellContent,
        true,
        path.resolve(__dirname, `../project/${projectName}/build.sh`)
      )

      await shellPro(projectName, logPath)
        .then(compressedPro)
        .catch(() => {
          status = 'error'
          popTask()
          console.log('error')
        })
    } else { // 执行打包工作流
      (
        await (install ? installAfterBuildPro : buildPro)(projectName, logPath)
          .then(compressedPro)
          .catch(() => {
            status = 'error'
            popTask()
            console.log('error')
          })
      )
    }

    let newData = getHistory()

    newData = newData.map(c => {
      if (c.id === id) {
        c.status = status
      }

      return c
    })

    setFileContentByName(
      'history',
      newData,
      true
    )
  })
})

router.post('/shell_build', [
  (() => ['projectName', 'branch', 'commitId', 'targetUrl']
    .map((fild) => body(fild).notEmpty().withMessage('projectName;branch;commitId;targetUrl is null!!'))
  )()
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    try {
      const { projectName, branch, commitId, targetUrl } = req.body

      const filename = `${projectName}-${branch}-${commitId}`

      const install = hasDirectory(path.resolve(__dirname, `../tags/${filename}/dist`))

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${filename}.zip`
      })

      if (install) {
        zipFilePipe(filename, res)

      } else {
        const { username, token } = getFileContentByName('gitToken')

        const [http, addr] = targetUrl.split('//')

        const gitTargetUrl = `${http}//${encodeURIComponent(username)}:${encodeURIComponent(token)}@${addr}`

        gitPro(
          gitTargetUrl,
          filename,
          'tags'
        ).then(() => {

          gitCheckoutPro(filename, branch, 'tags', true, commitId)
            .then(() => {
              installAfterBuildPro(filename, path.resolve(__dirname, `../tags/${filename}.log`), 'tags')
                .then(() => { // 压缩并暴露流

                  zipFilePipe(filename, res)

                })
                .catch(() => new Result(null, 'error!!').fail(res))

            })
        })
      }



    } catch (e) {
      console.log(e)
    }
  })
})


router.get('/get_log', [
  query('projectName').notEmpty().withMessage('projectName is null!!!')
], (req, res, next) => {
  checkBeforRes(next, req, () => {

    const { projectName } = req.query

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const logPath = path.resolve(__dirname, `../log/${projectName}.log`)

    const logContent = getFileContentByName(null, '', logPath)

    const data = { content: logContent.replace(/\n/g, '<br>') }
    /*
      防止请求时流程已经走完，从而监听不到最新日志内容
    */
    res.write(`data: ${data.content}\n\n`)

    const watcher = chokidar.watch(logPath, { persistent: true })

    watcher
      .on('change', (path) => {

        const logContent = getFileContentByName(null, '', path)  // 是否要做内容新旧对比只返回更改后的内容

        res.writable ? res.write(`data: ${logContent.replace(/\n/g, '<br>')}}\n\n`) : watcher.close()
      })

    req.on('end', watcher.close)
  })
})

router.get('/get_ws_log', [
  query('projectName').notEmpty().withMessage('projectName is null!!!')
], (req, res, next) => {
  checkBeforRes(next, req, () => {

    const { projectName } = req.query

    const logPath = path.resolve(__dirname, `../log/ws/${projectName}.log`)

    const logContent = getFileContentByName(null, '', logPath)

    new Result(logContent).success(res)
  })
})

router.get('/get_history', (req, res, next) => {
  const data = getFileContentByName('history', [])

  new Result(data).success(res)
})

router.post('/delete_as_history', [
  (() =>
    ['projects'].map((fild) =>
      body(fild)
        .notEmpty()
        .withMessage('projects is null'),
    ))(),
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { projects } = req.body

    const history = getFileContentByName('history')

    const projectIds = []

    let filterHistory = []

    const handleDelete = (func) => {

      projects.forEach(c => {

        func('builds', `${c.projectName}`) // 产物
        func('builds', `${c.projectName}.zip`) // 压缩产物
        func('log', `${c.projectName}.log`) // 产出日志

        projectIds.push(c.id)
      })
      
      filterHistory =
        projects.length === history.length ?
          [] : history.filter(c => !projectIds.includes(c.id))

      setFileContentByName(
        'history',
        filterHistory,
        true
      )
    }

    handleDelete(
      os.platform() === 'linux' ? rmRf : rmdirRecursive
    )

    new Result().success(res)

  })
})

router.post('/download', [
  query('projectName').notEmpty().withMessage('projectName is null!!!')
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { projectName } = req.query

    download(
      stream => {
        res.set({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename=${req.query.projectName}.zip`
        })

        stream.pipe(res)
      },
      () => new Result(null, 'download error').fail(res),
      path.resolve(__dirname, `../builds/${projectName}.zip`)
    )

  })
})

router.post('/publish', [
  (() =>
    ['pubTargetIp', 'pubTargetProt', 'pubTargetDir', 'pubTargetUser', 'pubTargetPwd', 'projectName'].map((fild) =>
      body(fild)
        .notEmpty()
        .withMessage('someing is null'),
    ))(),
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const {
      projectName,
      ...onter
    } = req.body

    try {
      setTempPublishConfig({
        ...onter,
        projectName,
        localPath: path.resolve(__dirname, `../builds/${projectName}`)
      })
    }
    catch (e) {
      console.log(e)
    }

    new Result(null, 'please check the log!').success(res)

    // publishTragetServer({
    //   ...onter,
    //   projectName,
    //   localPath: path.resolve(__dirname, `../builds/${projectName}`)
    // }, () => new Result(null, 'publish success').success(res), () => new Result(null, 'publish error').fail(res))

  })
})

router.post('/create_publish', [
  (() =>
    ['pubTargetIp', 'pubTargetProt', 'pubTargetDir', 'pubTargetUser', 'pubTargetPwd', 'describe'].map((fild) =>
      body(fild)
        .notEmpty()
        .withMessage('someing is null'),
    ))(),
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const data = getFileContentByName('publishList', [])

    const body = req.body

    const getPublishItem = () => {
      const item = data.find(c => c.id === body.id) || {}

      return [
        ...data.filter(c => c.id !== body.id),
        {
          ...item,
          ...body
        }
      ]
    }

    const items = body.id ? getPublishItem() : [
      ...data,
      {
        id: Date.now(),
        ...body
      }
    ]

    setFileContentByName(
      'publishList',
      items,
      true
    )

    new Result(null, 'create publish success!!').success(res)
  })
})

router.post('/get_publish_list', (req, res, next) => {
  checkBeforRes(next, req, () => {

    const data = getFileContentByName('publishList', [])
    new Result(data).success(res)
  })
})

router.get('/get_publish_item_by_id', [
  query('id').notEmpty().withMessage('id is null!!!')
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { id } = req.query
    const data = getFileContentByName('publishList', [])

    new Result(data.find(item => item.id == id) || {}).success(res)
  })
})

router.delete('/delete_publish', [
  query('id').notEmpty().withMessage('id is null!!!')
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { id } = req.query
    const data = getFileContentByName('publishList', [])

    setFileContentByName(
      'publishList',
      data.filter(item => item.id != id),
      true
    )

    new Result(null, 'delete publish success!!').success(res)
  })
})

router.post('/set_sys_config', [
  (() => ([
    'simuCount',
    'concurrentCount'
  ].map((fail) => 
    body(fail)
    .notEmpty()
    .withMessage(`${fail} is null`)
  )))()
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    
    const { simuCount, concurrentCount } = req.body

    const { tasking } = getFileContentByName('task', {})

    if(tasking && Array.isArray(tasking) &&tasking.length > 0) {
      return new Result(null, 'Execute when there is a task. Please make changes later.').fail(res)
    }

    setFileContentByName('task', {
      simuCount,
      concurrentCount,
      tasking: []
    }, true)

    new Result(null, 'Update config success!!!').success(res)
  })
})


router.get('/get_sys_config', (req, res, next) => {

  const task = getFileContentByName('task', {})
  
  new Result(task, 'success').success(res)
})

router.use((req, res, next) => {
  next(boom.notFound('api 404!'));
});

router.use((err, req, res, next) => {

  if (err) {
    const { statusCode: code, playload } = err?.output || {}

    const statusCode = code || 500

    const errMsg = playload?.error || err?.message

    new Result(null, errMsg)
      .fail(res.status(statusCode))
  }
})

module.exports = router;
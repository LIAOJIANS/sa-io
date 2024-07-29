
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

  gitPro,
  installAfterBuildPro,
  buildPro,
  gitCheckoutPro,
  shellPro,
  gitPullPro,
  rmDir,
  rmRf,

  Result,
} = require('../utils');

const publishTragetServer = require('../utils/publish')

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
      const { targetUrl, projectName, useToken } = req.body

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
        projectName,
        Date.now()
      ).then(() => {

        const data = getFileContentByName('projects', [])

        setFileContentByName('projects',
          [
            ...data,
            {
              ...req.body,
              install: true,
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
      return new Result(null, 'Running shell scripts must be in a Linux environment!!!')
        .fail(res)
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

          res.status(500).send('checkout error!!! Please review the log output!!!!!!')
        }

      } else if (pull) { // 拉取最新
        try {
          await gitPullPro(projectName, logPath)
        } catch (e) {
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
        publishTragetServer({
          ...left,
          localPath: path.resolve(__dirname, `../builds/${projectName}-${curTime}`)
        })
      }

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
          console.log('error')
        })
    } else { // 执行打包工作流
      (
        await (install ? installAfterBuildPro : buildPro)(projectName, logPath)
          .then(compressedPro)
          .catch(() => {
            status = 'error'
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

router.get('/get_history', (req, res, next) => {
  const data = getFileContentByName('history', [])

  new Result(data).success(res)
})

router.post('/delete_ass_history', [
  (() =>
    ['projects'].map((fild) =>
      body(fild)
        .notEmpty()
        .withMessage('username or token is null'),
  ))(),
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { projects } = req.body

    const history = getFileContentByName('history')

    const filterHistory = []

    const handleDelete = (func) => {
      projects.forEach(c => {

        func('builds', `${c.projectName}`) // 产物
        func('builds', `${c.projectName}.zip`) // 压缩产物
        func('log', `${c.projectName}.log`) // 产出日志

        const his = history.find(h => h.id !== c.id)
      
        if(his) {
          filterHistory.push(his)
        }

      })

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

    publishTragetServer({
      ...onter,
      localPath: path.resolve(__dirname, `../builds/${projectName}`)
    }, () => new Result(null, 'publish success').success(res), () => new Result(null, 'publish error').fail(res))

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

    setFileContentByName(
      'publishList',
      [
        ...data,
        {
          id: Date.now(),
          ...req.body
        }
      ],
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
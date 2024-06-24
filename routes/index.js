
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

  gitPro,
  installAfterBuildPro,
  buildPro,

  Result,
} = require('../utils');

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
      const { targetUrl, projectName } = req.body

      const { username, token } = getFileContentByName('gitToken')

      const data = getFileContentByName('projects', [])

      if (data.some(p => p.projectName == projectName)) {
        return new Result(null, 'has project!').fail(res)
      }

      const [http, addr] = targetUrl.split('//')

      const gitTargetUrl = `${http}//${encodeURIComponent(username)}:${encodeURIComponent(token)}@${addr}`

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

      const data = getFileContentByName('projects', [])

      setFileContentByName(
        'projects',
        data.filter(p => p.projectName !== projectName),
        true
      )

      if (os.platform() === 'linux') { // 如果是linux系统执行rm -rf， 删除速度快

        rmdirRecursive(projectName) // rm -rf 太危险，考虑换node的rm方法
      } else { // 其他系统则用fs.rm删除，稍慢

        rmdirRecursive(projectName)
      }

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

    new Result(shellContent).success()
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
    const { shell, install, shellContent, branch, projectName } = res.body

    if (os.platform() !== 'linux' && shell) {
      return new Result(null, 'Running shell scripts must be in a Linux environment!!!')
        .fail(res)
    }
    const curTime = Date.now()
    const fileName = `${projectName}-${curTime}.log`
    const logPath =  path.resolve(__dirname, `../log/${fileName}`)

    let status = 'success'

    // 生成构建历史
    const data = getFileContentByName('history', [])

    // 生成日志文件
    getFileContentByName(
      '',
      '',
      logPath
    )

    if (shell) { // 执行sh脚本

      setFileContentByName(
        projectName,
        shellContent,
        true,
        path.resolve(__dirname, `../project/${projectName}/build.sh`)
      )

      await shellPro(projectName, logPath)
        .then(() => new Result('build success !!!').success(res))
        .catch(() => {
          new Result(null, 'Please review the log output!!!').fail(res)
          status = 'error'
        })
    } else { // 执行打包工作流

      (
        [install ? 'installAfterBuildPro' : 'buildPro'](projectName, logPath)
          .then(() => new Result('build success !!!').success(res))
          .catch(() => {
            new Result(null, 'Please review the log output!!!').fail(res)
            status = 'error'
          })
      )

    }

    setFileContentByName(
      'history',
      data.push({
        projectName,
        buildTime: curTime,
        status
      }),
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

    const projects = getFileContentByName('history', [])

    const project = projects.find(p => p.projectName === projectName)

    if(!project) {
      return new Result().success(res)
    }

    const logPath = path.resolve(__dirname, `../log/${projectName}-${project.buildTime}.log`)
    chokidar
      .watch(logPath, { persistent: true })
      .on('change', (path) => {

        const logContent = getFileContentByName(null, '', path)  // 是否要做内容新旧对比只返回更改后的内容

        res.writable ? res.write(logContent) : watcher.close()
      })

    req.on('end', watcher.close)  
  })
})

router.get('/get_history', (req, res, next) => {
  const data = getFileContentByName('history', [])

  new Result(null, data).success(res)
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
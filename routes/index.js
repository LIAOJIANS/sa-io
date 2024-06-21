
const express = require('express');
const boom = require('boom')
const { body, query } = require('express-validator');
const os = require('os')

const {
  getJsonDataByName,
  checkBeforRes,
  setJsonDataByName,
  rmdirRecursive,

  gitPro,

  Result,
} = require('../utils');

const router = express.Router()

router.get('/get_git_token', (req, res, next) => {
  checkBeforRes(next, req, () => {
    const gitInfo = getJsonDataByName('gitToken');

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

      setJsonDataByName('gitToken', data, true);

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
    
    const { username, token } = getJsonDataByName('gitToken')

    const data = getJsonDataByName('projects', [])

    if(data.some(p => p.projectName == projectName)) {
      return new Result(null, 'has project!').fail(res)
    }

    const [ http, addr ] = targetUrl.split('//')

    const gitTargetUrl = `${http}//${encodeURIComponent(username)}:${encodeURIComponent(token)}@${addr}`

    // 根据projectName执行git工作流
    gitPro(
      gitTargetUrl,
      projectName
    ).then(() => {

      const data = getJsonDataByName('projects', [])

      setJsonDataByName('projects', 
        [
          ...data,
          { ...req.body, 
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
    const data = getJsonDataByName('projects', [])

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

      const data = getJsonDataByName('projects', [])

      setJsonDataByName(
        'projects', 
        data.filter(p => p.projectName !== projectName), 
        true
      )
      
      if(os.platform() === 'linux') { // 如果是linux系统执行rm -rf， 删除速度快
        
        rmdirRecursive(projectName) // rm -rf 太危险，考虑换node的rm方法
      } else { // 其他系统则用fs.rm删除，稍慢

        rmdirRecursive(projectName)
      }

      new Result(null, 'delete success!!').success(res)

    })
  }
)

router.post('/build', [
  (() =>
  ['shell', 'install', 'projectName', 'branch'].map((fild) =>
    body(fild)
      .notEmpty()
      .withMessage('username or token is null'),
  ))(),
], (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { shell, install, shellContent, branch, projectName } = res.body

    if(os.platform() !== 'linux' && shell) {
      return new Result(null, 'Running shell scripts must be in a Linux environment!!!')
        .fail(res)
    }

    if(shell) { // 创建.sh脚本，并执行
      shellPro(projectName)
        .then(() => {
          new Result().success(res)
        })
    } else { // 执行打包工作流

    }

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
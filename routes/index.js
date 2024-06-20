
const express = require('express');
const boom = require('boom')
const { body } = require('express-validator');

const {
  getJsonDataByName,
  checkBeforRes,
  setJsonDataByName,

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
          .withMessage('username or targetUrl or token is null'),
      ))(),
  ],
  (req, res, next) => {
    checkBeforRes(next, req, () => {
      const data = res.body;

      setJsonDataByName('gitToken', data, true);

      new Result(null, 'success!!!').success(res);
    });
  },
);

router.post(
  '/create_build_project',
  [

  ], 
  (req, res, next) => {
  checkBeforRes(next, req, () => {
    const { targetUrl, projectName } = req.body
    
    const { usename, token } = getJsonDataByName('gitToken')

    const [ http, addr ] = targetUrl.split('//')

    const gitTargetUrl = `${http}://${encodeURIComponent(usename)}:${encodeURIComponent(token)}@${addr}`

    // 根据projectName执行git 工作流
    gitPro(
      gitTargetUrl,
      projectName
    ).then(res => {
      new Result(null, 'create success!!').success(res)
    })
  });
});

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
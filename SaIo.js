
const {
  gitPro
} = require('./git')

const { install } = require('./install')
const { build } = require('./build')

gitPro()
  .then(async ({ cloneDir }) => {
    
  await install(cloneDir)
  build(cloneDir)

})

module.exports = {

  
  publicPath: './',

  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.99:3000',
        changeOrigin: true, 
        pathRewrite: { '^/api': '' }, 
      }
    }
  }
}
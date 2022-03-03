const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
  },
  devServer: {
    port: '8080',
    proxy: 'http://192.168.3.141:9706'
  }
};
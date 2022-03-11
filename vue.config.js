const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('vscode', 'monaco-languageclient/lib/vscode-compatibility')
      // .set('vscode-languageserver-protocol/lib/main', 'vscode-languageserver-protocol/lib/browser/main')
      // .set('vscode-languageserver-protocol/lib/utils/is', 'vscode-languageserver-protocol/lib/common/utils/is')
  },
  devServer: {
    port: '8080',
    proxy: 'http://192.168.3.141:9706'
  },
  configureWebpack: {
    externals: {
      vue: "Vue",
      "element-ui": "ELEMENT",
    },
    plugins: [
      new MonacoWebpackPlugin()
    ]
  }
};
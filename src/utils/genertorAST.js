/**
 * @description 代码转AST语法树
 * @author xuelang
 */

let acorn = require("acorn");

/**
 * 获取js语法树
 * @param code 代码字符串
 */
export function jsToAST(code){
  return acorn.parse(code, {ecmaVersion: 2020})
}

/**
 * 从js语法树获取函数信息
 * @param code 代码字符串
 */
export function getJsCodeFn(code){
  let ast = acorn.parse(code, {ecmaVersion: 2020})
  let result = {}
  ast.body.forEach((node) => {
    switch (node.type) {
      case 'FunctionDeclaration':
        node.params.forEach((item) => {
          item.value = ''
        })
        result[node.id.name] = {params: node.params}
        break;
      case 'VariableDeclaration':
        node.declarations.forEach((declar) => {
          if (declar.init.type === 'FunctionExpression') {
            declar.init.params.map((item) => {
              item.value = ''
            })
            result[declar.id.name] = {params: declar.init.params}
          }
        })
        break;
    }
  })
  return result
}

/**
 * 获取python的函数和参数
 * 附: 没有找到python转ast的插件
 */
export function getPythonCodeFn(code) {
  let result = {}
  try {
    const fnRegExp = /def.+?[:]/g
    let fnList = code.match(fnRegExp)
    fnList.forEach((str) => {
      let name = str.match(/[ ].+?[(]/g)[0].replace(/[ ]/g, '').slice(0,-1)
      let paramsStr = str.match(/[(].+?[)]/g) ? str.match(/[(].+?[)]/g)[0] : ''
      let params = {}
      if (paramsStr) {
        params = paramsStr.replace(/[ ]/g, '').slice(1,-1).split(',').map((param) => {
          return {name: param, value: ''}
        })
      }
      result[name] = {params}
    })
  }catch (error) {
    console.error(error)
  }
  return result
}

/**
 * 获取Ruby的函数和参数
 * 附: 没有找到Ruby转ast的插件
 */
export function getRubyCodeFn(code) {
  let result = {}
  try {
    const fnRegExp = /def.+?[)]/g;
    let fnList = code.match(fnRegExp)
    fnList.forEach((str) => {
      let name = str.match(/[ ].+?[(]/g)[0].replace(/[ ]/g, '').slice(0,-1)
      let paramsStr = str.match(/[(].+?[)]/g) ? str.match(/[(].+?[)]/g)[0] : ''
      let params = {}
      if (paramsStr) {
        params = paramsStr.replace(/[ ]/g, '').slice(1,-1).split(',').map((param) => {
          return {name: param, value: ''}
        })
      }
      result[name] = {params}
    })
  }catch (error) {
    // --snip--
  }
  return result
}

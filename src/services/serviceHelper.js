let dev = {
  normalURL: 'http://192.168.1.3:8080/',
  oraclesURL: 'http://192.168.1.3:8080//oracles',
}

let test = {
  normalURL: 'http://192.168.1.3:8080/',
  oraclesURL: 'http://192.168.1.3:8080//oracles',
}

let prod = {
  normalURL: 'http://192.168.1.3:8080/',
  oraclesURL: 'http://192.168.1.3:8080//oracles',
}

let RUNNING_ENV = { dev, test, prod }[process.env.NODE_ENV]

export const normalURL = RUNNING_ENV.normalURL
export const oraclesURL = RUNNING_ENV.oraclesURL

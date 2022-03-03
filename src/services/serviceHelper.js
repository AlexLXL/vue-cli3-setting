let dev = {
  normalURL: 'http://localhost:8080/',
  oraclesURL: 'http://localhost:8080//oracles',
}

let test = {
  normalURL: 'http://localhost:8080/',
  oraclesURL: 'http://localhost:8080//oracles',
}

let prod = {
  normalURL: 'http://localhost:8080/',
  oraclesURL: 'http://localhost:8080//oracles',
}

let RUNNING_ENV = { dev, test, prod }[process.env.NODE_ENV]

export const normalURL = RUNNING_ENV.normalURL
export const oraclesURL = RUNNING_ENV.oraclesURL

import http from '@/http'
import {oraclesURL} from '@/services/serviceHelper'

const Api = {
  addAccount: oraclesURL,
  deploy: oraclesURL,
}

//新增账号
export const addAccountApi = async (params) => {
  return await http.post(Api.addAccount, params)
}

//部署
export const deployApi = async (params) => {
  return await http.post(Api.deploy, params)
}

//执行函数
export  const execFunApi = async (params) => {
  return await http.post(Api.deploy, params)
}
import http from '@/http'
import {oraclesURL} from '@/services/serviceHelper'

const Api = {
  addAccount: oraclesURL,
}

//新增账号
export const addAccountApi = async (params) => {
  return await http.post(Api.addAccount, params)
}
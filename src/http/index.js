/**
 * @description 实例axios 单例模式
 * @author 学浪
 */

import Request from "./ajax";
const http = Request.getInstance({
  timeout: 10000
})
export default http;
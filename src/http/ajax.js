/**
 * @description 实例ajax 单例模式
 * @author 学浪
 */

import axios from "axios";
import qs from 'qs'

class Request {
  constructor(config) {
    // 创建axios实例
    this.axiosInstance = axios.create(config)
    // axios默认配置
    this.defaults()
    this.defaultConfig = {
      transformRequest: [(params) => JSON.stringify(params)],
      headers: {'Content-Type': 'text/plain;charset=UTF-8'}
    };
  }

  defaults() {
    this.axiosInstance.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
    this.axiosInstance.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest'
    this.axiosInstance.defaults.responseType = 'json'
    this.axiosInstance.defaults.transformRequest = [
      (params) => qs.stringify(params, {indices: false})
    ]
  }

  /**
   * http://localhost:8089/api/user/getUserById?userId=10
   * @param url   /api/user/getUserById
   * @param params  {userId:10}
   * @returns
   */
  get(url, params) {
    return new Promise((resolve, reject) => {
      this.axiosInstance.get(url, {
        params: params,
        paramsSerializer: (params) => qs.stringify(params)
      }).then((res) => {
        resolve(res.data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  /**
   * http://localhost:8089/api/user/getUserById/10
   * @param url   /api/user/getUserById
   * @param params  {userId:10}
   * @returns
   */
  getRestApi(url, params) {
    return new Promise((resolve, reject) => {
      this.axiosInstance.get(this.getParams(params) ? `${url}/${this.getParams(params)}` : url)
        .then((res) => {
          resolve(res.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  getParams(params) {
    let _params = '';
    if (Object.is(params, undefined || null)) {
      _params = '';
    }else {
      for (const key in params) {
        if (Reflect.get(params, key) && params[key]) {
          _params += `${params[key]}/`
        }
      }
    }
    if (_params) _params = _params.substr(0, _params.length - 1);
    return _params;
  }

  post(url, params, config) {
    config = Object.assign(this.defaultConfig, config)
    return new Promise((resolve, reject) => {
      this.axiosInstance.post(url, params, config).then((res) => {
        resolve(res.data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  put(url, params, config) {
    config = Object.assign(this.defaultConfig, config)
    return new Promise((resolve, reject) => {
      this.axiosInstance.put(url, params, config).then((res) => {
        resolve(res.data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  delete(url, params) {
    return new Promise((resolve, reject) => {
      let data = this.getParams(params)
      this.axiosInstance.delete(data ? `${url}/${data}` : url)
        .then((res) => {
          resolve(res.data)
        }).catch((error) => {
        reject(error)
      })
    })
  }

  postAny(url, params, config) {
    config = Object.assign(this.defaultConfig, config)
    return new Promise((resolve, reject) => {
      this.axiosInstance.post(url, params, config).then((res) => {
        resolve(res.data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  /**
   * 单例模式
   * @private
   */
  static getInstance(config) {
    if (!Request.instance) {
      Request.instance = new Request(config)
    }
    return Request.instance
  }
}

export default Request;
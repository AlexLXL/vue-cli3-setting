/**
 * @description 实例ajax 单例模式
 * @author 学浪
 */

import axios from "axios";
import qs from 'qs'
import {Message} from "element-ui";

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
    // axios拦截器
    this.interceptors()
  }

  defaults() {
    this.axiosInstance.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
    this.axiosInstance.defaults.headers.get['X-Requested-With'] = 'XMLHttpRequest'
    this.axiosInstance.defaults.responseType = 'json'
    this.axiosInstance.defaults.transformRequest = [
      (params) => qs.stringify(params, {indices: false})
    ]
  }

  //axios拦截器
  interceptors() {
    // 请求发送之前拦截
    this.axiosInstance.interceptors.request.use((config) => {
      return config
    }, (error) => {
      // 错误抛到业务代码
      error.data = {}
      error.data.msg = '服务器异常，请联系管理员！'
      return error
    })

    /**
     * 请求返回之后拦截
     * res的类型是AxiosResponse<any>
     */
    this.axiosInstance.interceptors.response.use((res) => {
      if (res && res.data) {
        const data = res.data;
        if (data.errorCode === 0) {
          return res;
        } else {
          Message.error(data.message || '服务器出错!');
          return null
        }
      }
    }, (error) => { // 这里是遇到报错的回调
      error.data = {};
      if (error && error.response) {
        switch (error.response.status) {
          case 400:
            error.data.msg = '错误请求';
            Message.error(error.data.msg)
            break
          case 401:
            error.data.msg = '未授权，请重新登录';
            Message.error(error.data.msg)
            break
          case 403:
            error.data.msg = '拒绝访问';
            Message.error(error.data.msg)
            break
          case 404:
            error.data.msg = '请求错误,未找到该资源';
            Message.error(error.data.msg)
            break
          case 405:
            error.data.msg = '请求方法未允许';
            Message.error(error.data.msg)
            break
          case 408:
            error.data.msg = '请求超时';
            Message.error(error.data.msg)
            break
          case 500:
            error.data.msg = '服务器端出错';
            Message.error(error.data.msg)
            break
          case 501:
            error.data.msg = '网络未实现';
            Message.error(error.data.msg)
            break
          case 502:
            error.data.msg = '网络错误';
            Message.error(error.data.msg)
            break
          case 503:
            error.data.msg = '服务不可用';
            Message.error(error.data.msg)
            break
          case 504:
            error.data.msg = '网络超时';
            Message.error(error.data.msg)
            break
          case 505:
            error.data.msg = 'http版本不支持该请求';
            Message.error(error.data.msg)
            break
          default:
            error.data.msg = `连接错误${error.response.status}`;
            Message.error(error.data.msg)
        }
      } else {
        error.data.msg = "连接到服务器失败";
        Message.error(error.data.msg)
      }
      return error
    })
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
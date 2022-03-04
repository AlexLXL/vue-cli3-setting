/**
 * @description 工具函数
 * @author xuelang
 */

/**
 * 防抖
 * @param fn 目标函数
 * @param delay 延迟时间
 */
export function debounce(fn, delay){
  let timer = null
  return function(...args) {
    let context = this
    if(timer){
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}
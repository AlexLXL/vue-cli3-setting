import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import eventHelper from "./utils/eventHelper";
import MonacoInstall from './plugins/MonacoInstall'
import "./css/init.scss"
import "./css/variable.scss"

Vue.prototype.$EventBus = eventHelper

Vue.use(MonacoInstall)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

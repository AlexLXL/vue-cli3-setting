import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import eventHelper from "./utils/eventHelper";

Vue.prototype.$EventBus = eventHelper

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

import Monaco from '@/components/MonacoEditor.vue'

export default {
  install: function (Vue) {
    Vue.component('monaco', Monaco)
  }
}

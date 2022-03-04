<template>
  <div class="onlineIDE">
    <monaco
      :codes="content"
      :readOnly="false"
      @codeChange="codeChange"
      @codeMounted="codeMounted"
    >
    </monaco>
  </div>
</template>

<script>
  export default {
    name: 'OnlineIDE2',
    data: function () {
      return {
        monacoEditor: '',
        content: ''
      }
    },
    methods: {
      codeMounted(editor) {
        this.monacoEditor = editor
      },
      codeChange(editor) {
        this.$EventBus.$emit('getHomeOnlineIDEValue', editor.getValue())
      }
    },
    mounted() {

    },
    components: {}
  }
</script>

<style scoped lang="scss">
  .onlineIDE {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
  }
</style>

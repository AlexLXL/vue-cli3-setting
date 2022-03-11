<template>
  <div class="onlineIDE">
    <monaco
      :codes="content"
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
  @import "@/css/mixin.scss";

  .onlineIDE {
    width: 99%;
    height: 99%;
    padding: 1%;
    box-sizing: border-box;
    border-radius: 20px;
    overflow: hidden;

    &::-webkit-scrollbar {
      width: 0;
      height: 10px;
      background-color: transparent;
    }
  }
</style>

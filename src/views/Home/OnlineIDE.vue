<template>
  <div class="onlineIDE">
    <MonacoEditor
      width="100%"
      height="100%"
      class="vs"
      style="text-align: left;background-color: #fff"
      language="ruby"
      :code="code"
      :editorOptions="options"
      @mounted="onMounted"
      @codeChange="onCodeChange"
    >
    </MonacoEditor>
  </div>
</template>

<script>
  import MonacoEditor from 'vue-monaco-editor'

  export default {
    name: 'OnlineIDE',
    data: function () {
      return {
        code: '',
        editor: null,
        options: {
          theme: "vs",
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          automaticLayout: true,
          glyphMargin: true,
          showFoldingControls: "always",
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
        }
      }
    },
    methods: {
      onMounted(editor) {
        this.editor = editor;
      },
      onCodeChange(editor) {
        console.log(editor)
      },
    },
    mounted() {

    },
    components: {
      MonacoEditor
    }
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

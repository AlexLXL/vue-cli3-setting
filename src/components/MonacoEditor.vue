<template>
  <div class="monaco-container">
    <div ref="container" class="monaco-editor"></div>
  </div>
</template>

<script>
  import * as monaco from 'monaco-editor'
  import {debounce} from '@/utils/util'

  export default {
    name: 'MonacoEditor',
    data: function () {
        return {
          monacoEditor: '',
          codeChangeEmitter: ''
        }
    },
    props: {
      // 编辑器中呈现的内容
      codes: {
        type: String,
        default: function () {
          return ''
        }
      },
      readOnly: {
        type: Boolean,
        default: function () {
          return false
        }
      },
      // 主要配置
      editorOptions: {
        type: Object,
        default: function () {
          return {
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: this.readOnly, // 只读
            cursorStyle: 'line', // 光标样式
            automaticLayout: false, // 自动布局
            glyphMargin: true, // 字形边缘
            useTabStops: false,
            fontSize: 28, // 字体大小
            autoIndent: false // 自动布局
          }
        }
      }
    },
    methods: {
      createMonaco() {
        this.monacoEditor = monaco.editor.create(this.$refs.container, {
          value: this.codes, // 见props
          language: 'javascript',
          theme: 'vs-dark', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
          editorOptions: this.editorOptions // 同codes
        })
        this.monacoEditor.onDidChangeModelContent(() => {
          this.codeChangeHandler(this.monacoEditor)
        })
        this.$emit('codeMounted', this.monacoEditor);
      },
      codeChangeHandler(editor) {
        if (this.codeChangeEmitter) {
          this.codeChangeEmitter(editor);
        } else {
          this.codeChangeEmitter = debounce(
            function(editor) {
              this.$emit('codeChange', editor);
            }, 500
          );
          this.codeChangeEmitter(editor);
        }
      },
      destroyMonaco() {
        if (typeof this.editor !== 'undefined') {
          this.editor.dispose();
        }
      }
    },
    mounted () {
      this.createMonaco()
    }
  }
</script>

<style scoped lang="scss">
  .monaco-container {
    width: 100%;
    height: 100%;

    .monaco-editor {
      width: 100%;
      height: 100%;
    }
  }
</style>

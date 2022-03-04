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
      init() {
        this.createMonaco()
        this.initEventHelper()
      },
      initEventHelper() {
        this.$EventBus.$on('changeHomeOnlineIDELanguage', (language) => {
          monaco.editor.setModelLanguage(this.monacoEditor.getModel(), language);
        })
      },
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
        this.createPythonTip()
        this.createRubyTip()
        this.$emit('codeMounted', this.monacoEditor);
      },
      createPythonTip() {
        monaco.languages.registerCompletionItemProvider('python', {
          provideCompletionItems: function (model, position) {
            // 获取当前行数
            const line = position.lineNumber;
            // 获取当前列数
            const column = position.column;
            // 获取当前输入行的所有内容
            const content = model.getLineContent(line)
            // 通过下标来获取当前光标后一个内容，即为刚输入的内容
            const sym = content[column - 2];
            model.getValueInRange({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            });
            let word = model.getWordUntilPosition(position);
            let range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };
            //---------------------------------------------------
            //上面的代码仅仅是为了获取sym，即提示符
            //---------------------------------------------------
            let suggestions = [];
            if (sym === "$") {
              //...
              //拦截到用户输入$，开始设置提示内容，同else中代码一致，自行拓展
            } else {
              //直接提示，以下为当前语言关键词提示
              let keyWords = [
                // This section is the result of running
                // `for k in keyword.kwlist: print('  "' + k + '",')` in a Python REPL,
                // though note that the output from Python 3 is not a strict superset of the
                // output from Python 2.
                'False', // promoted to keyword.kwlist in Python 3
                'None', // promoted to keyword.kwlist in Python 3
                'True', // promoted to keyword.kwlist in Python 3
                'and',
                'as',
                'assert',
                'async', // new in Python 3
                'await', // new in Python 3
                'break',
                'class',
                'continue',
                'def',
                'del',
                'elif',
                'else',
                'except',
                'exec', // Python 2, but not 3.
                'finally',
                'for',
                'from',
                'global',
                'if',
                'import',
                'in',
                'is',
                'lambda',
                'nonlocal', // new in Python 3
                'not',
                'or',
                'pass',
                'print', // Python 2, but not 3.
                'raise',
                'return',
                'try',
                'while',
                'with',
                'yield',

                'int',
                'float',
                'long',
                'complex',
                'hex',

                'abs',
                'all',
                'any',
                'apply',
                'basestring',
                'bin',
                'bool',
                'buffer',
                'bytearray',
                'callable',
                'chr',
                'classmethod',
                'cmp',
                'coerce',
                'compile',
                'complex',
                'delattr',
                'dict',
                'dir',
                'divmod',
                'enumerate',
                'eval',
                'execfile',
                'file',
                'filter',
                'format',
                'frozenset',
                'getattr',
                'globals',
                'hasattr',
                'hash',
                'help',
                'id',
                'input',
                'intern',
                'isinstance',
                'issubclass',
                'iter',
                'len',
                'locals',
                'list',
                'map',
                'max',
                'memoryview',
                'min',
                'next',
                'object',
                'oct',
                'open',
                'ord',
                'pow',
                'print',
                'property',
                'reversed',
                'range',
                'raw_input',
                'reduce',
                'reload',
                'repr',
                'reversed',
                'round',
                'self',
                'set',
                'setattr',
                'slice',
                'sorted',
                'staticmethod',
                'str',
                'sum',
                'super',
                'tuple',
                'type',
                'unichr',
                'unicode',
                'vars',
                'xrange',
                'zip',

                '__dict__',
                '__methods__',
                '__members__',
                '__class__',
                '__bases__',
                '__name__',
                '__mro__',
                '__subclasses__',
                '__init__',
                '__import__'
              ]
              for (let i in keyWords) {
                suggestions.push({
                  label: keyWords[i], // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                  insertText: keyWords[i], // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                });
              }
            }
            return { suggestions };
          },
          triggerCharacters: ["$", ""]
        });
      },
      createRubyTip() {
        monaco.languages.registerCompletionItemProvider('ruby', {
          provideCompletionItems: function (model, position) {
            // 获取当前行数
            const line = position.lineNumber;
            // 获取当前列数
            const column = position.column;
            // 获取当前输入行的所有内容
            const content = model.getLineContent(line)
            // 通过下标来获取当前光标后一个内容，即为刚输入的内容
            const sym = content[column - 2];
            model.getValueInRange({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            });
            let word = model.getWordUntilPosition(position);
            let range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };
            //---------------------------------------------------
            //上面的代码仅仅是为了获取sym，即提示符
            //---------------------------------------------------
            let suggestions = [];
            if (sym === "$") {
              //...
              //拦截到用户输入$，开始设置提示内容，同else中代码一致，自行拓展
            } else {
              //直接提示，以下为当前语言关键词提示
              let keyWords = [
                '__LINE__',
                '__ENCODING__',
                '__FILE__',
                'BEGIN',
                'END',
                'alias',
                'and',
                'begin',
                'break',
                'case',
                'class',
                'def',
                'defined?',
                'do',
                'else',
                'elsif',
                'end',
                'ensure',
                'for',
                'false',
                'if',
                'in',
                'module',
                'next',
                'nil',
                'not',
                'or',
                'redo',
                'rescue',
                'retry',
                'return',
                'self',
                'super',
                'then',
                'true',
                'undef',
                'unless',
                'until',
                'when',
                'while',
                'yield'
              ]
              for (let i in keyWords) {
                suggestions.push({
                  label: keyWords[i], // 显示的提示内容
                  kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                  insertText: keyWords[i], // 选择后粘贴到编辑器中的文字
                  detail: '', // 提示内容后的说明
                  range: range
                });
              }
            }
            return { suggestions }
          },
          triggerCharacters: ["$", ""]
        });
      },
      codeChangeHandler(editor) {
        if (this.codeChangeEmitter) {
          this.codeChangeEmitter(editor);
        } else {
          this.codeChangeEmitter = debounce(
            function (editor) {
              this.$emit('codeChange', editor);
            }, 500
          );
          this.codeChangeEmitter(editor);
        }
      },
      destroyMonaco() {
        if (typeof this.monacoEditor !== 'undefined') {
          this.monacoEditor.dispose();
        }
      }
    },
    mounted() {
      this.init()
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

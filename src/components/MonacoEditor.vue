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
          let languageMap = {
            js: 'javascript',
            python: 'python',
            ruby: 'ruby'
          }
          monaco.editor.setModelLanguage(this.monacoEditor.getModel(), languageMap[language]);
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
        let self = this
        monaco.languages.registerCompletionItemProvider('python', {
          provideCompletionItems: function (model, position) {
            let word = model.getWordUntilPosition(position);
            let range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            let suggestions = [];
            //关键字补全
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
            // 基于已输入词（Token）补全
            let tokens = self.getTokens(self.monacoEditor.getValue());
            for (const item of tokens) {
              if (item != word.word) {
                suggestions.push({
                  label: item,
                  kind: monaco.languages.CompletionItemKind.Text,	// Text 没有特殊意义 这里表示基于文本&单词的补全
                  documentation: "",
                  insertText: item,
                  range: range
                });
              }
            }
            return {suggestions};
          }
        });
      },
      createRubyTip() {
        let self = this
        monaco.languages.registerCompletionItemProvider('ruby', {
          provideCompletionItems: function (model, position) {
            let word = model.getWordUntilPosition(position);
            let range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            let suggestions = [];
            //关键字补全
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
            // 基于已输入词（Token）补全
            let tokens = self.getTokens(self.monacoEditor.getValue());
            for (const item of tokens) {
              if (item != word.word) {
                suggestions.push({
                  label: item,
                  kind: monaco.languages.CompletionItemKind.Text,	// Text 没有特殊意义 这里表示基于文本&单词的补全
                  documentation: "",
                  insertText: item,
                  range: range
                });
              }
            }
            return {suggestions};
          }
        });
      },
      getTokens(code) {
        const identifierPattern = "([a-zA-Z_]\\w*)";	// 正则表达式定义 注意转义\\w
        let identifier = new RegExp(identifierPattern, "g");	// 注意加入参数"g"表示多次查找
        let tokens = [];
        let array1;
        while ((array1 = identifier.exec(code)) !== null) {
          tokens.push(array1[0]);
        }
        return Array.from(new Set(tokens));			// 去重
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

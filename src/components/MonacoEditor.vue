<template>
  <div class="monaco-container">
    <div ref="container" class="monaco-editor"></div>
  </div>
</template>

<script>
  // import * as monaco from 'monaco-editor'
  import {debounce} from '@/utils/util'
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

  export default {
    name: 'MonacoEditor',
    data: function () {
      return {
        monacoEditor: '',       // monaco实例
        codeChangeEmitter: ''   // monaco修改内容回调
      }
    },
    props: {
      codes: {
        type: String,
        default: function () {
          return ''
        }
      }, // manaco内容
      readOnly: {
        type: Boolean,
        default: function () {
          return false
        }
      }, // manaco只读
      editorOptions: {
        type: Object,
        default: function () {
          return {
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: this.readOnly,  // 只读
            cursorStyle: 'line',      // 光标样式
            automaticLayout: false,   // 自动布局
            glyphMargin: true,        // 字形边缘
            useTabStops: false,
            fontSize: 28,             // 字体大小
            autoIndent: false         // 自动布局
          }
        }
      } // manaco配置
    },
    methods: {
      init() {
        this.createMonaco()
        this.initEventHelper()
      },
      /**
       * 绑定组件事件
       */
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
      /**
       * 创建Monaco实例
       */
      createMonaco() {
        this.monacoEditor = monaco.editor.create(this.$refs.container, {
          value: this.codes, // props
          language: 'javascript',
          theme: 'vs-dark', // 主题: vs, hc-black, vs-dark
          editorOptions: this.editorOptions // props
        })
        this.createMonacoEvent()
        this.createPythonTip()
        this.createRubyTip()
        this.$emit('codeMounted', this.monacoEditor);
      },
      /**
       * 绑定Monaco实例事件
       */
      createMonacoEvent() {
        this.monacoEditor.onDidChangeModelContent(() => {
          this.codeChangeHandler(this.monacoEditor)

          this.$nextTick(() => {
            //获取当前的鼠标位置
            let pos = this.monacoEditor.getPosition()
            if (pos) {
              let line = pos.lineNumber //获取当前的行
              if (this.monacoEditor.getModel().getLineContent(line).trim() === '') { // 空行
                this.removeBreakPoint(line)
              } else {
                if (this.hasBreakPoint(line)) { //如果当前行存在断点
                  this.removeBreakPoint(line)
                  this.addBreakPoint(line)
                }
              }
            }
          })
        })

        this.monacoEditor.onMouseDown(e => {
          console.log(e)
          // 限制点击的位置
          if (e.target.detail
            && e.target.detail.offsetX
            && e.target.detail.offsetX >= 0
            && e.target.detail.offsetX <= 25
          ) {
            let line = e.target.position.lineNumber
            if (this.monacoEditor.getModel().getLineContent(line).trim() === '') {
              return
            }
            // 添加断点/删除断点
            if (!this.hasBreakPoint(line)) {
              this.addBreakPoint(line)
            } else {
              this.removeBreakPoint(line)
            }
            //如果存在上个位置，将鼠标移到上个位置，否则使editor失去焦点
            if (this.lastPosition) {
              this.monacoEditor.setPosition(this.lastPosition)
            } else {
              document.activeElement.blur()
            }
          }
          //更新lastPosition为当前鼠标的位置（只有点击编辑器里面的内容的时候）
          if (e.target.type === 6 || e.target.type === 7) {
            this.lastPosition = this.monacoEditor.getPosition()
          }
        })
      },
      /**
       * 创建python语法提示
       */
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
      /**
       * 创建Ruby语法提示
       */
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
      /**
       * 文本获取(token)
       */
      getTokens(code) {
        const identifierPattern = "([a-zA-Z_]\\w*)";	// 正则表达式定义 注意转义\\w
        let identifier = new RegExp(identifierPattern, "g");	// 注意加入参数"g"表示多次查找
        let tokens = [];
        let array1;
        while ((array1 = identifier.exec(code)) !== null) {
          tokens.push(array1[0]);
        }
        return Array.from(new Set(tokens));	// 去重
      },
      /**
       * 文本修改回调
       */
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
      /**
       * 销毁Monaco实例
       */
      destroyMonaco() {
        if (typeof this.monacoEditor !== 'undefined') {
          this.monacoEditor.dispose();
        }
      },
      /**
       * 获取当前语言
       */
      getMonacoLanguage() {
        return this.monacoEditor.getModel().getLanguageIdentifier().language
      },
      /**
       * 断点: 添加断点
       */
      async addBreakPoint (line) {
        let model = this.monacoEditor.getModel()
        if (!model) return
        let value = {range: new monaco.Range(line, 1, line, 1), options: { isWholeLine: true, linesDecorationsClassName: 'breakpoints' }}
        model.deltaDecorations([], [value])
      },
      /**
       *  断点: 删除断点（如果指定了line，删除指定行的断点，否则删除当前model里面的所有断点）
       */
      async removeBreakPoint (line) {
        let model = this.monacoEditor.getModel()
        if (!model) return
        let decorations
        let ids = []
        if (line !== undefined) {
          decorations = this.monacoEditor.getLineDecorations(line)
        } else {
          decorations = this.monacoEditor.getAllDecorations()
        }
        for (let decoration of decorations) {
          if (decoration.options.linesDecorationsClassName === 'breakpoints') {
            ids.push(decoration.id)
          }
        }
        if (ids && ids.length) {
          model.deltaDecorations(ids, [])
        }
      },
      /**
       * 断点: 判断是否有断点
       */
      hasBreakPoint (line) {
        let decorations = this.monacoEditor.getLineDecorations(line)
        for (let decoration of decorations) {
          if (decoration.options.linesDecorationsClassName === 'breakpoints') {
            return true
          }
        }
        return false
      },
      /**
       * 断点: 获取断点
       */
      getBreakPoint() {
        let breakpoints = this.monacoEditor
          .getModel()
          .getAllDecorations()
          .filter(it => it.options.linesDecorationsClassName === 'breakpoints')
          .map(it => it.range.startLineNumber)
          .join(',')
          console.log(breakpoints) // 3,4
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

    /deep/ .breakpoints{
      background-color: #c75450;
      width: 10px !important;
      height: 10px !important;
      left: 15% !important;
      top: 3px;
      border-radius: 5px;
    }
  }
</style>

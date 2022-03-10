<template>
  <div class="monaco-container">
    <div ref="container" class="monaco-editor"></div>
  </div>
</template>

<script>
  import * as monaco from 'monaco-editor'
  import {debounce} from '@/utils/util'
  import { listen } from "vscode-ws-jsonrpc";
  import {
    MonacoLanguageClient,
    CloseAction,
    ErrorAction,
    MonacoServices,
    createConnection,
  } from "monaco-languageclient";
  import ReconnectingWebSocket from "reconnecting-websocket"
  import {getRubyCodeFn} from '@/utils/genertorAST'

  // 插件有bug, 误删
  window.monaco = monaco
  window.setImmediate = setImmediate

  export default {
    name: 'MonacoEditor',
    data: function () {
      return {
        monacoEditor: '',       // monaco实例
        codeChangeEmitter: '',  // monaco修改内容回调
      }
    },
    props: {
      // manaco内容
      codes: {
        type: String,
        default: function () {
          return ''
        }
      },
      // manaco配置
      editorOptions: {
        type: Object,
        default: function () {
          return {
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,          // 只读
            cursorStyle: 'line',      // 光标样式
            automaticLayout: false,   // 自动布局
            glyphMargin: true,        // 字形边缘
            useTabStops: false,
            fontSize: 28,             // 字体大小
            autoIndent: false         // 自动布局
          }
        }
      },
      // Language Server Protocol
      pythonLspSocket: {
        type: String,
        default: function () {
          return 'ws://127.0.0.1:5000/python'
        }
      },
    },
    methods: {
      init() {
        this.registerLanguage()   // 注册语言
        this.createModel()        // 创建model
        this.createMonacoJS()     // 创建monaco实例
        this.initEventHelper()    // 组件事件
      },

      // 注册语言
      registerLanguage() {
        let self = this

        monaco.languages.register({
          id: 'python',
          extensions: ['.python', '.py', '.pyd'],
          aliases: ['Python', 'python'],
          mimetypes: ['application/json'],
        });

        monaco.languages.registerSignatureHelpProvider('ruby', {
          signatureHelpTriggerCharacters: [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '$', '_', '@'
          ],
          provideSignatureHelp: function (model, position) {
            let currFnName = model.getWordUntilPosition(position);
            let fnList = getRubyCodeFn(self.getMonacoValue())

            let label = ''
            try {
              let result = fnList[currFnName.word].params.reduce((count, item) => {
                count.push(item.name)
                return count
              }, [])
              label = `${currFnName.word} ( ${result.join(',')} )`
            }catch (e) {
              label = ''
            }

            let signatures
            if (label) {
              signatures = [{
                label: label,
                documentation: "",
                parameters: []
              }]
            }else {
              signatures = []
            }

            return {
              dispose: () => {},
              value: {
                signatures,
                activeSignature: 0,
                activeParameter: 0
              },
            };
          }
        });
      },

      // 创建model
      createModel() {
        let model = monaco.editor.getModel(monaco.Uri.parse("inmemory://model.json"))
        if (!model) {
          model = monaco.editor.createModel(
            this.codes,
            "javascript",
            monaco.Uri.parse("inmemory://model.json")
          )
        }
        this.model = model
      },
      setModelValue(v = '') {
        this.model.setValue(v)
      },
      setModelLanguage(languages = 'javascript') {
        monaco.editor.setModelLanguage(this.model, languages)
      },

      // 创建Monaco实例（js）
      createMonacoJS() {
        this.setModelLanguage('javascript')
        this.setModelValue()

        this.monacoEditor = monaco.editor.create(this.$refs.container, {
          model: this.model,
          language: 'javascript',
          theme: 'vs-dark', // 主题: vs, hc-black, vs-dark
          editorOptions: this.editorOptions // props
        })
        this.createMonacoEvent()
        this.$emit('codeMounted', this.monacoEditor);
      },
      // 绑定Monaco事件
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
      // 文本修改回调
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

      // 创建Monaco实例（python）
      createMonacoPython() {
        this.setModelLanguage('python')
        this.setModelValue()

        this.monacoEditor = monaco.editor.create(this.$refs.container, {
          model: this.model,
          language: 'python',
          glyphMargin: true,
          theme: 'vs-dark',
          lightbulb: {
            enabled: true,
          },
          editorOptions: this.editorOptions
        })

        // install Monaco language client services
        try {
          MonacoServices.get()
        }catch (e) {
          MonacoServices.install(this.monacoEditor);
          this.connectPythonLspSocket(this.pythonLspSocket)
        }

        this.createMonacoEvent()
        this.$emit('codeMounted', this.monacoEditor);
      },
      // 连接python语法提示后台
      connectPythonLspSocket() {
        const webSocket = this.createWebSocket(this.pythonLspSocket);

        listen({
          webSocket,
          onConnection: (connection) => {
            // create and start the language client
            const languageClient = this.createLanguageClient(connection);
            const disposable = languageClient.start();
            connection.onClose(() => disposable.dispose());
          }
        });
      },
      // 连接websocket
      createWebSocket(url) {
        const socketOptions = {
          maxReconnectionDelay: 10000,
          minReconnectionDelay: 1000,
          reconnectionDelayGrowFactor: 1.3,
          connectionTimeout: 10000,
          maxRetries: 10,
          debug: false,
        };
        return new ReconnectingWebSocket(url, [], socketOptions);
      },
      // 创建python语法提示客户端
      createLanguageClient(connection) {
        return new MonacoLanguageClient({
          name: "python Language Client",
          clientOptions: {
            documentSelector: ["python"],
            errorHandler: {
              error: () => ErrorAction.Continue,
              closed: () => CloseAction.DoNotRestart,
            },
          },
          connectionProvider: {
            get: (errorHandler, closeHandler) => {
              return Promise.resolve(
                createConnection(connection, errorHandler, closeHandler)
              );
            },
          },
        });
      },

      // 创建Monaco实例（ruby）
      createMonacoRuby() {
        this.setModelLanguage('ruby')
        this.setModelValue()

        this.monacoEditor = monaco.editor.create(this.$refs.container, {
          model: this.model,
          language: 'ruby',
          theme: 'vs-dark', // 主题: vs, hc-black, vs-dark
          editorOptions: this.editorOptions // props
        })

        this.createRubyTip()
        this.createMonacoEvent()
        this.$emit('codeMounted', this.monacoEditor);
      },
      // 创建Ruby语法提示1
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
      // 创建Ruby语法提示2
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

      // 组件事件
      initEventHelper() {
        this.$EventBus.$on('changeHomeOnlineIDELanguage', (language) => {
          if (language === 'js') {
            this.destroyMonaco()
            this.createMonacoJS()
          } else if (language === 'python') {
            this.destroyMonaco()
            this.createMonacoPython()
          } else if (language === 'ruby') {
            this.destroyMonaco()
            this.createMonacoRuby()
          }
          this.$emit('codeChange', this.monacoEditor);
          // monaco.editor.setModelLanguage(this.monacoEditor.getModel(), languageMap[language]);
        })
      },
      // 销毁Monaco实例
      destroyMonaco() {
        if (typeof this.monacoEditor !== 'undefined') {
          this.monacoEditor.dispose();
        }
      },

      // 添加断点
      async addBreakPoint(line) {
        let model = this.monacoEditor.getModel()
        if (!model) return
        let value = {
          range: new monaco.Range(line, 1, line, 1),
          options: {isWholeLine: true, linesDecorationsClassName: 'breakpoints'}
        }
        model.deltaDecorations([], [value])
      },
      // 删除断点（如果指定了line，删除指定行的断点，否则删除当前model里面的所有断点）
      async removeBreakPoint(line) {
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
      // 判断是否有断点
      hasBreakPoint(line) {
        let decorations = this.monacoEditor.getLineDecorations(line)
        for (let decoration of decorations) {
          if (decoration.options.linesDecorationsClassName === 'breakpoints') {
            return true
          }
        }
        return false
      },
      // 获取断点
      getBreakPoint() {
        let breakpoints = this.monacoEditor
          .getModel()
          .getAllDecorations()
          .filter(it => it.options.linesDecorationsClassName === 'breakpoints')
          .map(it => it.range.startLineNumber)
          .join(',')
        console.log(breakpoints) // 3,4
      },

      // 获取输入框的值
      getMonacoValue() {
        return this.monacoEditor.getValue()
      },
      // 获取当前语言
      getMonacoLanguage() {
        return this.monacoEditor.getModel().getLanguageIdentifier().language
      },
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

    /deep/ .breakpoints {
      background-color: #c75450;
      width: 10px !important;
      height: 10px !important;
      left: 15% !important;
      top: 3px;
      border-radius: 5px;
    }
  }
</style>

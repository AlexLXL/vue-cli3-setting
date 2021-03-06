<template>
  <div class="homeRight">
    <el-form :model="formData" status-icon :rules="formRule" ref="ruleForm" class="demo-ruleForm">

      <div class="labelLayout">
        <p class="formItemLabel">Contract ID</p>
      </div>
      <el-form-item label="" prop="contractId">
        <el-input
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="please enter the call contract ID"
          v-model="formData.contractId">
        </el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Shard Name</p>
      </div>
      <el-form-item label="" prop="shardName">
        <el-input v-model="formData.shardName" placeholder="please enter the shard name"></el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Call Function</p>
      </div>
      <el-form-item label="" prop="execName">
        <el-select v-model="formData.execName" placeholder="please enter the call function" size="small" clearable
                   allow-create filterable>
          <el-option
            v-for="(value, key) in formData.execList"
            :key="key"
            :label="key"
            :value="key">
          </el-option>
        </el-select>
      </el-form-item>

      <div class="labelLayout" v-if="formData.execList[formData.execName]">
        <p class="formItemLabel">Parameter</p>
      </div>
      <div v-if="formData.execList[formData.execName]">
        <el-form-item label="" v-for="(param) in formData.execList[formData.execName].params" :key="param.name">
          <el-input v-model="param.value">
            <template slot="prepend">{{param.name}}</template>
          </el-input>
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="" prop="parameter">
          <el-input
            type="textarea"
            :rows="3"
            resize="none"
            placeholder="please input parameter"
            v-model="formData.parameter">
          </el-input>
        </el-form-item>
      </div>
    </el-form>

    <el-button plain class="callBtn" @click="verifyForm">CALL</el-button>

    <el-input
      v-show="formData.callResultVisible"
      type="textarea"
      class="callResult"
      disabled
      :rows="10"
      v-model="formData.callResult">
    </el-input>
  </div>
</template>

<script>
  import {execFnApi} from '@/services/homeService'
  import {getJsCodeFn, getPythonCodeFn, getRubyCodeFn} from '@/utils/genertorAST'

  export default {
    name: 'HomeLeft',
    data: function () {
      return {
        formData: {
          shardName: '',
          contractId: '',
          execName: '',
          execList: {},
          parameter: '',
          callResult: '',
          callResultVisible: false,
        },
        formRule: {
          shardName: [
            {required: true, message: 'please fill in the Shard Name', trigger: 'blur'}
          ],
          contractId: [
            {required: true, message: 'Please fill in the Contract ID', trigger: 'blur'}
          ],
          execName: [
            {required: true, message: 'please choose Call Function', trigger: 'change'}
          ]
        }
      }
    },
    methods: {
      init() {
        this.initEventHelper()
      },
      initEventHelper() {
        this.$EventBus.$on('deployAccountSuccess', (data) => {
          let deployResult = JSON.parse(data)
          let {shardName, hash: contractId} = deployResult
          Object.assign(this.formData, {shardName, contractId})
          this.getCodeFn(deployResult)
        })
      },
      getCodeFn(deployResult) {
        let execs = {
          js: this.getJSCodeFn,
          python: this.getPythonCodeFn,
          ruby: this.getRubyCodeFn
        }
        this.formData.execName = ''
        execs[deployResult.languages](deployResult.contract)
      },
      getJSCodeFn(code) {
        this.formData.execList = getJsCodeFn(code)
      },
      getPythonCodeFn(code) {
        this.formData.execList = getPythonCodeFn(code)
      },
      getRubyCodeFn(code) {
        this.formData.execList = getRubyCodeFn(code)
      },
      verifyForm() {
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            this.execFunction()
          }
        })
      },
      async execFunction() {
        this.$emit('switchLoading', true)
        let fp = ''
        if (Reflect.get(this.formData.execList, this.formData.execName)) {
          fp = this.formData.execList[this.formData.execName].params.reduce((total, item) => {
            total += `${item.value},`
            return total
          }, '')
          fp = fp.slice(0, -1)
          fp = '[' + fp + ']'
        } else {
          fp = this.formData.parameter
        }
        let result = await execFnApi({
          S: this.formData.shardName,
          cf: this.formData.execName,
          id: this.formData.contractId,
          fp: fp,
          action: 'call',
          mode: 'Contract'
        })
        this.$emit('switchLoading', false)
        this.formData.callResult = result.message
        this.formData.callResultVisible = true
      },
    },
    mounted() {
      this.init()
    },
    beforeDestroy() {
      this.$EventBus.$off('deployAccountSuccess')
    }
  }
</script>

<style scoped lang="scss">
  @import "@/css/mixin.scss";

  .homeRight {
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
    padding: 10px;

    .el-form {
      .labelLayout {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .formItemLabel {
          font-size: 18px;
          color: #fff;
          font-family: Montserrat, sans-serif;
          font-weight: bold;
        }
      }

      .el-form-item {
        .el-input {
          width: 100%;
          /deep/ .el-input__inner {
            @include elInputInner;
          }
        }

        .el-select {
          width: 100%;
          /deep/ .el-input__inner {
            @include elInputInner;
          }
        }

        .el-textarea {
          /deep/ .el-textarea__inner {
            @include elTextAreaInner;
          }
        }
      }
    }

    .callBtn {
      width: 100%;
      @include elBtn;
    }

    .callResult {
      margin-top: 20px;

      /deep/ .el-textarea__inner {
        @include elTextAreaInner;
        @include scrollBar;
      }
    }

    @include scrollBar;
  }
</style>

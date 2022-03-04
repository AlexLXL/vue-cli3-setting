<template>
  <div class="homeRight">
    <el-form :model="formData" status-icon :rules="formRule" ref="ruleForm" class="demo-ruleForm">

      <div class="labelLayout">
        <p class="formItemLabel">Shard Name</p>
      </div>
      <el-form-item label="" prop="shardName">
        <el-input v-model="formData.shardName" placeholder="please enter the shard name"></el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Contract ID</p>
      </div>
      <el-form-item label="" prop="contractId">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="please enter the call contract ID"
          v-model="formData.contractId">
        </el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Call Function</p>
      </div>
      <el-form-item label="" prop="language">
        <el-select v-model="formData.execName" placeholder="please enter the call function" size="small">
          <el-option
            v-for="item in formData.execList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Parameter</p>
      </div>
      <el-form-item label="" prop="parameter">
        <el-input
          type="textarea"
          :rows="4"
          v-model="formData.parameter">
        </el-input>
      </el-form-item>
    </el-form>

    <el-button plain class="callBtn" @click="verifyForm">CALL</el-button>

    <el-input
      v-show="formData.callResultVisible"
      type="textarea"
      class="callResult"
      :rows="10"
      v-model="formData.callResult">
    </el-input>
  </div>
</template>

<script>
  import {execFunApi} from '@/services/homeService'

  export default {
    name: 'HomeLeft',
    data: function () {
      return {
        formData: {
          shardName: '',
          contractId: '',
          execName: '',
          execList: [],
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
          ],
          parameter: [
            {required: true, message: 'Please fill in the parameter', trigger: 'blur'}
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
          let {shardName, hash: contractId} = JSON.parse(data)
          Object.assign(this.formData, {shardName, contractId})
        })
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
        let result = await execFunApi({
          Sa: this.formData.accountAlgorithm,
          action: 'createAcc',
          mode: 'Algorithms'
        })
        this.$emit('switchLoading', false)
        console.log(JSON.parse(result.message))
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
          font-size: 16px;
        }
      }


      .el-form-item {
        .el-input {
          width: 100%;
        }

        .el-select {
          width: 100%;
        }
      }
    }

    .callBtn {
      width: 100%;
      background-color: #efefef;
    }

    .callResult {
      margin-top: 20px;
    }

    &::-webkit-scrollbar {
      width: 0px;
      height: 10px;
      background-color: transparent;
    }
  }
</style>

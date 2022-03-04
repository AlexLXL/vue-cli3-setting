<template>
  <div class="homeLeft">
    <el-form :model="formData" status-icon :rules="formRule" ref="ruleForm" class="demo-ruleForm">

      <div class="labelLayout">
        <p class="formItemLabel">Hash Algorithm</p>
      </div>
      <el-form-item label="" prop="hashAlgorithm">
        <el-select v-model="formData.hashAlgorithm" placeholder="please choose" size="small">
          <el-option
            v-for="item in formData.hashAlgorithmList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Account Algorithm</p>
        <el-button plain class="BuildBtn" size="mini" @click="verifyForm('build')">Build</el-button>
      </div>
      <el-form-item label="" prop="accountAlgorithm">
        <el-select v-model="formData.accountAlgorithm" placeholder="please choose" size="small">
          <el-option
            v-for="item in formData.accountAlgorithmList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Account</p>
      </div>
      <el-form-item label="" prop="account">
        <el-input
          type="textarea"
          :rows="5"
          v-model="formData.account">
        </el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Key</p>
      </div>
      <el-form-item label="" prop="key">
        <el-input
          type="textarea"
          :rows="5"
          v-model="formData.key">
        </el-input>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Language</p>
      </div>
      <el-form-item label="" prop="language">
        <el-select v-model="formData.language" placeholder="please choose" size="small">
          <el-option
            v-for="item in formData.languageList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <div class="labelLayout">
        <p class="formItemLabel">Remarks</p>
      </div>
      <el-form-item label="" prop="remarks">
        <el-input
          type="textarea"
          :rows="4"
          v-model="formData.remarks">
        </el-input>
      </el-form-item>
    </el-form>

    <el-button plain class="deployBtn" @click="verifyForm('deploy')">DEPLOY</el-button>

    <el-input
      v-show="formData.deployResultVisible"
      type="textarea"
      class="deployResult"
      :rows="10"
      v-model="formData.deployResult">
    </el-input>
  </div>
</template>

<script>
  import {addAccountApi, deployApi} from '@/services/homeService'

  export default {
    name: 'HomeLeft',
    data: function () {
      return {
        formData: {
          hashAlgorithm: '',
          hashAlgorithmList: [
            {
              value: 'sha3',
              label: 'sha3',
            },
            {
              value: 'sm3',
              label: 'sm3',
            },
          ],
          accountAlgorithm: '',
          accountAlgorithmList: [
            {
              value: 'rsa',
              label: 'rsa',
            },
            {
              value: 'sm2',
              label: 'sm2',
            },
          ],
          account: '',
          key: '',
          language: '',
          languageList: [
            {
              value: 'js',
              label: 'JavaScript',
            },
            {
              value: 'python',
              label: 'Python',
            },
            {
              value: 'ruby',
              label: 'Ruby',
            }
          ],
          remarks: '',
          deployResult: '',
          deployResultVisible: false,
          deployCode: ''
        },
        formRule: {},
        formRuleDict: {
          build: {
            accountAlgorithm: [
              {required: true, message: 'please choose Account Algorithm', trigger: 'change'}
            ],
          },
          deploy: {
            hashAlgorithm: [
              {required: true, message: 'please choose Hash Algorithm', trigger: 'change'}
            ],
            account: [
              {required: true, message: 'Please fill in the Account', trigger: 'blur'}
            ],
            key: [
              {required: true, message: 'Please fill in the key', trigger: 'blur'}
            ],
            language: [
              {required: true, message: 'please choose Language', trigger: 'change'}
            ],
            remarks: [
              {required: true, message: 'Please fill in the remarks', trigger: 'blur'}
            ],
          }
        },
      }
    },
    methods: {
      init() {
        this.initEventHelper()
      },
      initEventHelper() {
        this.$EventBus.$on('getHomeOnlineIDEValue', (str) => {
          this.formData.deployCode = str
        })
      },
      verifyForm(type) {
        let exec = {
          build: this.addAccount,
          deploy: this.deploy,
        }
        this.formRule = this.formRuleDict[type]
        this.$nextTick(() => {
          this.$refs.ruleForm.validate((valid) => {
            switch (type) {
              case 'build':
                if (valid) exec[type]()
                break;
              case 'deploy':
                if (valid && this.verifyCode) exec[type]()
                break;
            }
          })
        })
      },
      verifyCode() {
        return !!this.formData.deployCode
      },
      async addAccount() {
        this.$emit('switchLoading', true)
        let result = await addAccountApi({
          Sa: this.formData.accountAlgorithm,
          action: 'createAcc',
          mode: 'Algorithms'
        })
        this.$emit('switchLoading', false)
        let {sa, sk} = JSON.parse(result.message)
        this.formData.account = sa
        this.formData.key = sk
      },
      async deploy() {
        this.$emit('switchLoading', true)
        let result = await deployApi({
          Ha: this.formData.hashAlgorithm,
          Sa: this.formData.accountAlgorithm,
          action: 'deploy',
          cc: this.formData.deployCode,
          cd: this.formData.remarks,
          cl: this.formData.language,
          mode: "Contract",
          sa: this.formData.account,
          sk: this.formData.key
        })
        this.$emit('switchLoading', false)
        this.formData.deployResult = result.message
        if(this.formData.deployResult) {
          this.formData.deployResultVisible = true
          this.$EventBus.$emit('deployAccountSuccess', result.message)
        }
      },
    },
    mounted() {
      this.init()
    }
  }
</script>

<style scoped lang="scss">
  .homeLeft {
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

        .BuildBtn {
          background-color: #efefef;
        }
      }


      .el-form-item {
        .el-select {
          width: 100%;
        }

        .el-select {
          width: 100%;
        }
      }
    }

    .deployBtn {
      width: 100%;
      background-color: #efefef;
    }

    .deployResult {
      margin-top: 20px;
    }

    &::-webkit-scrollbar {
      width: 0px;
      /*对垂直流动条有效*/
      height: 10px;
      /*对水平流动条有效*/
      background-color: transparent;
    }
  }
</style>

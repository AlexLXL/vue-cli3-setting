<template>
  <div class="home" v-loading="pageLoading">
    <el-row>
      <el-col :span="6">
        <HomeLeft @switchLoading="switchLoading" msg="Welcome to Your Vue.js App"/>
      </el-col>
      <el-col :span="12">
        2222
      </el-col>
      <el-col :span="6">
        3333
      </el-col>
    </el-row>
  </div>
</template>

<script>
import HomeLeft from './HomeLeft.vue'

export default {
  name: 'Home',
  data: function () {
      return {
        pageLoading: false
      }
  },
  methods: {
    switchLoading(isOpen) {
      this.pageLoading = isOpen
    }
  },
  components: {
    HomeLeft
  }
}
</script>

<style scoped lang="scss">
  .home {
    height: 100%;

    .el-row {
      height: 100%;

      .el-col {
        height: 100%;
      }
    }
  }
</style>

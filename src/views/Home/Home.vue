<template>
  <div class="home" v-loading="pageLoading">
    <el-row>
      <el-col :span="6">
        <HomeLeft @switchLoading="switchLoading"></HomeLeft>
      </el-col>
      <el-col :span="12">
        <OnlineIDE></OnlineIDE>
      </el-col>
      <el-col :span="6">
        <HomeRight @switchLoading="switchLoading"></HomeRight>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import HomeLeft from './HomeLeft.vue'
import HomeRight from './HomeRight.vue'
import OnlineIDE from './OnlineIDE.vue'

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
    HomeLeft,
    HomeRight,
    OnlineIDE
  }
}
</script>

<style scoped lang="scss">
  .home {
    background-color: #3c3f41;
    height: 100%;
    overflow: hidden;

    .el-row {
      height: 100%;

      .el-col {
        height: 100%;
      }
    }
  }
</style>

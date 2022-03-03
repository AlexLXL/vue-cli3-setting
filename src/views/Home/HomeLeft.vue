<template>
  <div class="homeLeft">
    首页左边
  </div>
</template>

<script>
  import {addAccountApi} from '../../services/homeService'

  export default {
    name: 'HomeLeft',
    methods: {
      async addAccount() {
        let result = await addAccountApi({
          Sa: "sm2",
          action: "createAcc",
          mode: "Algorithms"
        })
        console.log(result)
      }
    },
    mounted() {
      this.addAccount()
    }
  }
</script>

<style scoped lang="scss">

</style>

<template>
  <div class="home">
    <!--<img alt="Vue logo" src="@/assets/logo.png">-->
    <HomeLeft msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HomeLeft from './HomeLeft.vue'

export default {
  name: 'Home',
  components: {
    HomeLeft
  }
}
</script>

<template>
  <div class="container">
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<style lang="scss">
  @import "./css/init.scss";
  html, body, .container {
    height: 100%;
  }
</style>

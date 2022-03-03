<template>
  <div>
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<style lang="scss">
  @import "./css/init.scss";
  html, body, #app {
    height: 100%;
  }
</style>

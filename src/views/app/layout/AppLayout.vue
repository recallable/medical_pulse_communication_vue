<template>
  <div class="app-layout">
    <router-view />

    <van-tabbar v-model="active" route fixed safe-area-inset-bottom>
      <van-tabbar-item replace to="/app/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/app/broadcast" icon="play-circle-o">e脉播</van-tabbar-item>
      <van-tabbar-item replace to="/app/case" icon="records">病例库</van-tabbar-item>
      <van-tabbar-item replace to="/app/guide" icon="guide-o">指南</van-tabbar-item>
      <van-tabbar-item replace to="/app/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const active = ref(0);
</script>

<style scoped>
.app-layout {
  padding-bottom: 50px;
  /* 预留底部导航高度 */
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>

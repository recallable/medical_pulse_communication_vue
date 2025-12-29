<template>
  <!-- <RouterView /> -->
  <router-view></router-view>
</template>
<script setup>
import ws from '@/api/ws';

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}') || JSON.parse(sessionStorage.getItem('userInfo') || '{}')

ws.connect(`ws://localhost:8000/api/v1/ws/${userInfo.id}`)
</script>
<style scoped></style>

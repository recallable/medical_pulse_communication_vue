<template>
  <div class="admin-layout">
    <div class="sidebar">
      <h2>后台管理系统</h2>
      <!-- 菜单占位 -->
    </div>
    <div class="main-content">
      <div class="header">Header</div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 200px;
  background: #001529;
  color: #fff;
  padding: 20px;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
}
</style>

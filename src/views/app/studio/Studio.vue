<template>
  <div class="studio-entry">
    <DoctorStudio v-if="userIdentity === 1" />
    <PatientConsultation v-else-if="userIdentity === 0" />
    <div v-else class="loading-state">
      <van-loading type="spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DoctorStudio from './DoctorStudio.vue';
import PatientConsultation from './PatientConsultation.vue';

const userIdentity = ref<number | null>(null);

onMounted(() => {
  const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (storedUser) {
    try {
      const userInfo = JSON.parse(storedUser);
      // 假设 user_identity 字段存在且为数字
      // 如果没有该字段，默认为 0（普通用户）或根据业务调整
      userIdentity.value = typeof userInfo.user_identity === 'number' ? userInfo.user_identity : 0;
      
      console.log('Current User Identity:', userIdentity.value);
    } catch (e) {
      console.error('UserInfo parse error', e);
      userIdentity.value = 0; // 默认普通用户
    }
  } else {
    userIdentity.value = 0; // 未登录或无信息，视作普通用户（或跳转登录）
  }
});
</script>

<style scoped>
.studio-entry {
  height: 100%;
}
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

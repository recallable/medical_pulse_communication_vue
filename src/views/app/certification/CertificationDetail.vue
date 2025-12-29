<template>
  <div class="certification-detail-page">
    <van-nav-bar title="认证详情" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div style="padding: 20px; text-align: center;">
      <van-icon name="passed" size="64" color="#07c160" />
      <h3 style="margin-top: 10px;">已认证</h3>
      <p style="color: #666; margin-top: 10px;">您已完成实名认证。</p>

      <van-cell-group inset style="margin-top: 20px; text-align: left;">
        <van-cell title="姓名" value="张三" />
        <van-cell title="身份证号" value="330************123" />
        <!-- <van-cell title="职业" value="医生" /> -->
      </van-cell-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const onClickLeft = () => {
  router.back();
};
</script>

<style scoped>
.certification-detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}
</style>

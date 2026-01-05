<template>
  <div class="case-library">
    <!-- 顶部导航区域 -->
    <div class="header">
      <div class="header-top">
        <div class="header-title">医脉通-临床病例平台</div>
        <div class="header-subtitle">Medlive-Clinical Cases Platform</div>
        <div class="header-icons">
          <van-icon name="bell" size="24" />
          <div class="avatar-placeholder">
            <van-icon name="user-circle-o" size="24" />
          </div>
        </div>
        <van-icon name="share-o" size="24" class="share-icon" />
      </div>

      <!-- 搜索框 -->
      <van-search v-model="searchText" shape="round" placeholder="输入疾病/症状/治疗等关键词查询病例" @search="onSearch">
        <template #right-icon>
          <van-icon name="photograph" />
        </template>
      </van-search>
    </div>

    <!-- 功能金刚区 -->
    <div class="function-grid">
      <div class="grid-item" @click="showToast('功能开发中')">
        <div class="icon-wrapper blue">
          <van-icon name="records" />
        </div>
        <span>病例挑战</span>
      </div>
      <div class="grid-item" @click="showToast('功能开发中')">
        <div class="icon-wrapper cyan">
          <van-icon name="like" />
        </div>
        <span>名家病例汇</span>
      </div>
      <div class="grid-item" @click="showToast('功能开发中')">
        <div class="icon-wrapper orange">
          <van-icon name="friends" />
        </div>
        <span>模拟病人</span>
      </div>
    </div>

    <!-- 标签页与列表 -->
    <van-sticky>
      <van-tabs v-model:active="activeTab" swipeable @change="onTabChange">
        <van-tab title="推荐" name="recommend"></van-tab>
        <van-tab v-for="dept in departments" :key="dept" :title="dept" :name="dept"></van-tab>

        <template #nav-right>
          <div class="tab-filter" @click="showToast('筛选功能开发中')">
            <van-icon name="filter-o" />
          </div>
        </template>
      </van-tabs>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <!-- 列表内容 -->
        <div class="case-list">
          <div v-for="(item, index) in list" :key="index" class="case-card" @click="goToDetail(item)">

            <!-- 头部：如果是专题/置顶等，可以特殊处理。这里统一展示为普通卡片或带图卡片 -->
            <!-- 模拟数据中没有专题标识，根据原型图模拟一种带大图的样式，一种普通样式 -->

            <div class="case-header">
              <!-- 头像与作者 -->
              <div class="author-info" v-if="item.raw_data.doctor_name">
                <van-image round width="20" height="20" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
                <span class="author-name">{{ item.raw_data.doctor_name }}</span>
                <van-icon name="v-o" color="#faab0c" />
              </div>
            </div>

            <div class="case-title" v-html="item.highlight_disease || item.raw_data.disease_name"></div>

            <div class="case-summary"
              v-html="item.highlight_symptoms || item.diagnosis_conclusion || item.raw_data.diagnosis_conclusion"></div>

            <!-- 图片展示区域（模拟） -->
            <div class="case-images" v-if="index % 2 === 0"> <!-- 偶数项展示多图 -->
              <van-image width="32%" height="80" radius="4"
                src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" />
              <van-image width="32%" height="80" radius="4"
                src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg" />
              <van-image width="32%" height="80" radius="4"
                src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg" />
            </div>
            <div class="case-images-single" v-else-if="index % 3 === 0"> <!-- 3的倍数展示大图 -->
              <van-image width="100%" height="120" radius="4"
                src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
            </div>

            <div class="case-footer">
              <span class="dept-tag">{{ item.department || item.raw_data.department }}</span>
              <div class="footer-stats">
                <span>浏览 {{ Math.floor(Math.random() * 2000) }}</span>
                <span> | 评论 {{ Math.floor(Math.random() * 50) }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 悬浮发布按钮 -->
    <div class="fab-btn" @click="showToast('发布病例功能开发中')">
      <van-icon name="edit" size="24" color="#fff" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from 'vant';
import { getCaseList } from '@/api/case';
import type { CaseItem, SearchRequest } from '@/api/case';

const searchText = ref('');
const activeTab = ref('recommend');
const departments = ['心内科', '呼吸科', '消化科', '神经内科', '内分泌科', '骨科', '耳鼻喉科', '风湿免疫科', '妇科', '儿科', '皮肤科'];

const list = ref<CaseItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);

const onLoad = async () => {
  if (refreshing.value) {
    list.value = [];
    refreshing.value = false;
  }

  try {
    const params: SearchRequest = {
      page: page.value,
      size: 10,
      keyword: searchText.value || undefined,
      filters: activeTab.value === 'recommend' ? undefined : { department: activeTab.value }
    };

    const res = await getCaseList(params);

    if (res.data.code === 200) {
      const results = res.data.data.results;
      if (results && results.length > 0) {
        list.value.push(...results);
        // 判断是否已加载完所有数据
        if (list.value.length >= res.data.data.total) {
          finished.value = true;
        } else {
          page.value++;
        }
      } else {
        finished.value = true;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    console.error(error);
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => {
  refreshing.value = true;
  finished.value = false;
  loading.value = true;
  page.value = 1;
  onLoad();
};

const onSearch = () => {
  onRefresh();
};

const onTabChange = () => {
  onRefresh();
};

const goToDetail = (item: CaseItem) => {
  // 暂时无详情页，提示
  showToast(`查看病例: ${item.record_no}`);
};
</script>

<style scoped>
.case-library {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.header {
  background: #fff;
  padding: 10px 16px 0;
}

.header-top {
  position: relative;
  text-align: center;
  margin-bottom: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-subtitle {
  font-size: 10px;
  color: #999;
  letter-spacing: 1px;
}

.header-icons {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-icon {
  position: absolute;
  right: 0;
  top: 40px;
  /* 调整分享图标位置 */
  display: none;
  /* 原型图右上角是分享，但这里已有布局，暂隐藏或调整 */
}

/* 覆盖 Vant 搜索框样式 */
:deep(.van-search) {
  padding: 10px 0;
}

:deep(.van-search__content) {
  background-color: #f7f8fa;
}

/* 金刚区 */
.function-grid {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background: #fff;
  margin-bottom: 10px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.icon-wrapper.blue {
  background: linear-gradient(135deg, #6c8ef8, #4e6ef2);
}

.icon-wrapper.cyan {
  background: linear-gradient(135deg, #4dc9e6, #28a9ce);
}

.icon-wrapper.orange {
  background: linear-gradient(135deg, #ffba7d, #ff9642);
}

/* 筛选图标 */
.tab-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #fff;
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.02);
  color: #666;
  font-size: 18px;
}

/* 列表样式 */
.case-list {
  padding: 10px;
}

.case-card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
}

.case-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.author-name {
  font-weight: bold;
  color: #333;
}

.case-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.case-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-images {
  display: flex;
  gap: 2%;
  margin-bottom: 10px;
}

.case-images-single {
  margin-bottom: 10px;
}

.case-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.dept-tag {
  color: #1989fa;
  background: #e8f4ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.footer-stats {
  flex: 1;
  margin-left: 10px;
}

.fab-btn {
  position: fixed;
  right: 20px;
  bottom: 80px;
  /* 避开 tabbar */
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4e6ef2, #28a9ce);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(78, 110, 242, 0.4);
  z-index: 99;
}
</style>

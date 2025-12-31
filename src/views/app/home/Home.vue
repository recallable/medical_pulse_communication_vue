<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-left" @click="goToAiChat">
        <div class="ai-icon-wrapper">
          <van-icon name="chat-o" size="20" color="#fff" />
          <span class="ai-text">AI问答</span>
        </div>
      </div>
      <div class="nav-center">
        <van-search v-model="searchText" shape="round" background="transparent" placeholder="搜疾病、药品、指南、课程等"
          class="custom-search" />
      </div>
      <div class="nav-right">
        <div class="icon-item">
          <van-icon name="sign" size="24" />
          <span class="icon-text">签到</span>
        </div>
        <div class="icon-item">
          <van-badge dot>
            <van-icon name="bell" size="24" />
          </van-badge>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <van-tabs v-model:active="activeTab" sticky animated swipeable>
      <van-tab v-for="tab in tabs" :key="tab" :title="tab">
        <!-- 仅在推荐页展示完整内容，其他页展示占位 -->
        <div v-if="tab === '推荐'" class="tab-content">
          <!-- Banner -->
          <div class="banner-section">
            <van-swipe :autoplay="3000" indicator-color="white" class="my-swipe">
              <van-swipe-item>
                <img src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" class="banner-img" />
              </van-swipe-item>
              <van-swipe-item>
                <img src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg" class="banner-img" />
              </van-swipe-item>
            </van-swipe>
          </div>

          <!-- 金刚区图标 -->
          <div class="grid-menu">
            <van-grid :column-num="5" :border="false">
              <van-grid-item v-for="item in gridItems" :key="item.text" :icon="item.icon" :text="item.text"
                :icon-color="item.color" @click="handleGridItemClick(item)" />
            </van-grid>
          </div>

          <!-- 医学工具抽屉 -->
          <van-popup v-model:show="showTools" position="bottom" round closeable :style="{ height: '80%' }">
            <div class="tools-drawer">
              <div class="drawer-header">医学工具</div>
              <div class="drawer-content">
                <div v-for="(section, index) in toolsSections" :key="index" class="tool-section">
                  <div v-if="section.title" class="section-title">{{ section.title }}</div>
                  <van-grid :column-num="5" :border="false">
                    <van-grid-item v-for="tool in section.items" :key="tool.text" :text="tool.text"
                      @click="handleToolClick(tool)">
                      <template #icon>
                        <div class="tool-icon-wrapper">
                          <van-badge v-if="tool.badge" :content="tool.badge" position="top-right">
                            <div class="tool-icon" :style="{ backgroundColor: tool.bg || '#fff' }">
                              <van-icon :name="tool.icon" :color="tool.color" size="24" />
                            </div>
                          </van-badge>
                          <div v-else class="tool-icon" :style="{ backgroundColor: tool.bg || '#fff' }">
                            <van-icon :name="tool.icon" :color="tool.color" size="24" />
                          </div>
                        </div>
                      </template>
                    </van-grid-item>
                  </van-grid>
                </div>
              </div>
            </div>
          </van-popup>

          <!-- 今日早报 -->
          <div class="news-section">
            <div class="news-header">
              <span class="news-title-main">今日早报</span>
              <span class="news-more">查看更多 <van-icon name="arrow" /></span>
            </div>

            <div class="news-card">
              <div class="news-tag">业内新闻</div>
              <div class="news-content">
                戈勒姆-斯托托综合征表现为骨溶解和淋巴管增生，18F-FAPI-42 PET/CT成像助力诊断...
              </div>
            </div>
          </div>

          <!-- 资讯列表 -->
          <div class="info-list">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
              <div v-for="item in articleList" :key="item.id" class="list-item" @click="openArticle(item.url)">
                <div class="item-content">
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-meta">{{ typeText }} · {{ item.input_time }}</div>
                </div>
                <div class="item-image">
                  <img :src="item.thumb" class="real-img" alt="资讯图片" />
                </div>
              </div>
            </van-list>
          </div>
        </div>
        <div v-else class="empty-placeholder">
          {{ tab }} 内容建设中...
        </div>
      </van-tab>

    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getArticleList } from '@/api/home';
import type { Article } from '@/api/home';
import { showToast, Popup, Badge, Grid, GridItem } from 'vant';

const router = useRouter();
const searchText = ref('');
const activeTab = ref(0);
const loading = ref(false);
const finished = ref(false);
const articleList = ref<Article[]>([]);
const cursorId = ref(0);
const showTools = ref(false);

interface ToolItem {
  text: string;
  icon: string;
  color: string;
  action?: string;
  bg?: string;
  badge?: string;
}

const tabs = ['推荐', '发现', '最热', '资讯', '进展', '全科医疗', '儿科'];

const gridItems: ToolItem[] = [
  { text: 'e信使', icon: 'envelop-o', color: '#00c49f' },
  { text: '用药参考', icon: 'notes-o', color: '#5c9aff' },
  { text: '诊疗知识库', icon: 'bookmark-o', color: '#9a66ff' },
  { text: '医脉3D', icon: 'play-circle-o', color: '#ff6b00' },
  { text: '医学助考', icon: 'award-o', color: '#ff9800' },
  { text: 'e学院', icon: 'wap-home-o', color: '#00c49f' },
  { text: '工作室', icon: 'manager-o', color: '#5c9aff' },
  { text: '发论文', icon: 'chart-trending-o', color: '#ff5722' },
  { text: '麦粒任务', icon: 'todo-list-o', color: '#ff9800' },
  { text: '医学工具', icon: 'apps-o', color: '#00c49f' },
];

const toolsSections: { title: string; items: ToolItem[] }[] = [
  {
    title: '常用工具',
    items: [
      { text: '知识银行', icon: 'gold-coin-o', color: '#ff9800', action: 'knowledge' },
    ]
  },
  {
    title: '指南用药',
    items: [
      { text: '指南解读', icon: 'orders-o', color: '#00c49f' },
      { text: '每周更新', icon: 'replay', color: '#5c9aff' },
      { text: '特殊人群', icon: 'friends-o', color: '#9a66ff' },
      { text: '相互作用', icon: 'exchange', color: '#ff9800' },
      { text: '配伍禁忌', icon: 'warn-o', color: '#5c9aff' },
      { text: '抗菌谱', icon: 'shield-o', color: '#5c9aff' }
    ]
  },
  {
    title: '其他医学工具',
    items: [
      { text: '科普写作', icon: 'edit', color: '#ff5722', badge: '限免' },
      { text: '医学公式', icon: 'bar-chart-o', color: '#5c9aff' },
      { text: '罕见病助手', icon: 'like-o', color: '#00c49f' },
      { text: '文献检索', icon: 'search', color: '#ff9800' },
      { text: '医学检验', icon: 'aim', color: '#ff9800' },
      { text: '医税顾问', icon: 'balance-o', color: '#5c9aff' },
      { text: '选刊投稿', icon: 'todo-list-o', color: '#5c9aff' },
      { text: '麦粒商城', icon: 'shop-o', color: '#ff9800' },
      { text: '血糖管家', icon: 'fire-o', color: '#ff5722' }
    ]
  },
  {
    title: '平台内容',
    items: [
      { text: '知识银行', icon: 'gold-coin-o', color: '#ff9800', action: 'knowledge' },
      { text: 'e研通', icon: 'chart-trending-o', color: '#5c9aff' },
      { text: '专栏', icon: 'column', color: '#ff9800' },
      { text: '进展', icon: 'upgrade', color: '#ff5722' },
      { text: '业内新闻', icon: 'newspaper-o', color: '#5c9aff' },
      { text: '病例', icon: 'records', color: '#ff5722' },
      { text: '会议', icon: 'tv-o', color: '#9a66ff' },
      { text: '圈子', icon: 'chat-o', color: '#00c49f' },
      { text: 'e调研', icon: 'passed', color: '#9a66ff' }
    ]
  }
];

const handleGridItemClick = (item: ToolItem) => {
  console.log('点击了:', item.text);
  if (item.text === '医学工具') {
    showTools.value = true;
    console.log('显示工具抽屉:', showTools.value);
  }
};

const handleToolClick = (tool: ToolItem) => {
  if (tool.action === 'knowledge') {
    router.push('/app/knowledge/bank');
  } else {
    showToast('功能开发中');
  }
};

const goToAiChat = () => {
  router.push('/app/ai/chat');
};

const onLoad = async () => {
  try {
    const res = await getArticleList({
      article_id: cursorId.value,
      limit: 10
    });

    if (res.data.code === 200) {
      const list = res.data.data;
      if (list.length > 0) {
        // 清洗数据中的 URL 和 thumb
        const cleanedList = list.map(item => ({
          ...item,
          url: item.url ? item.url.trim().replace(/^[`'"]+|[`'"]+$/g, '') : '',
          thumb: item.thumb ? item.thumb.trim().replace(/^[`'"]+|[`'"]+$/g, '') : ''
        }));
        articleList.value.push(...cleanedList);
        // 更新游标为最后一条数据的ID，用于下次加载
        cursorId.value = list[list.length - 1].id;
      }

      // 如果返回数据少于 limit，说明没有更多数据了
      if (list.length < 10) {
        finished.value = true;
      }
    } else {
      showToast(res.data.message || '加载失败');
      finished.value = true; // 出错也停止加载，避免无限重试
    }
  } catch (error) {
    console.error('加载文章列表失败', error);
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const openArticle = (url: string) => {
  if (url) {
    // 简单的清理 URL，防止包含多余的空格或字符
    const cleanUrl = url.trim().replace(/^[`'"]+|[`'"]+$/g, '');
    window.location.href = cleanUrl;
  }
};

const typeText = computed(() => {
  return '新闻'
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 50px;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  margin-right: 8px;
}

.ai-icon-wrapper {
  background-color: #2c3e50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ai-text {
  font-size: 8px;
  color: #fff;
  transform: scale(0.8);
}

.nav-center {
  flex: 1;
}

.custom-search {
  padding: 0;
}

:deep(.van-search__content) {
  background-color: #f7f8fa;
}

.nav-right {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 12px;
  color: #333;
}

.icon-text {
  font-size: 10px;
}

/* Banner */
.banner-section {
  padding: 12px;
}

.my-swipe .van-swipe-item {
  border-radius: 8px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

/* 金刚区 */
.grid-menu {
  margin-bottom: 12px;
}

/* 今日早报 */
.news-section {
  padding: 0 12px;
  margin-bottom: 20px;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.news-title-main {
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  color: #333;
}

.news-more {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
}

.news-card {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}

.news-tag {
  display: inline-block;
  background-color: #ff9800;
  color: #fff;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  margin-bottom: 4px;
}

.news-content {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

/* 资讯列表 */
.info-list {
  padding: 0 12px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-content {
  flex: 1;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.item-image {
  width: 100px;
  height: 65px;
  border-radius: 4px;
  overflow: hidden;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  color: #fff;
  font-weight: bold;
}

.bg-blue {
  background-color: #448aff;
}

.bg-dark-blue {
  background-color: #1565c0;
}

.real-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-placeholder {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 抽屉样式 */
.tools-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.drawer-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  padding: 20px 0;
  color: #333;
  flex-shrink: 0;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 20px 0;
}

.section-title {
  padding: 0 16px;
  font-size: 14px;
  color: #333;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
}

.tool-section {
  margin-bottom: 10px;
}

:deep(.van-grid-item__content) {
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.van-grid-item__icon) {
  margin-bottom: 8px !important;
}

:deep(.van-grid-item__text) {
  margin-top: 0 !important;
}

.tool-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.tool-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: #f7f8fa; */
}
</style>

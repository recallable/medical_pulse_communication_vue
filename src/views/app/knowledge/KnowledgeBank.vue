<template>
  <div class="knowledge-bank">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="知识银行"
      left-arrow
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="manager-o" size="18" color="#333" />
      </template>
    </van-nav-bar>

    <!-- 搜索框 -->
    <van-search
      v-model="searchText"
      shape="round"
      placeholder="搜索您感兴趣的课程"
      class="custom-search"
    />

    <!-- 标签页 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="推荐">
        <div class="tab-content">
          <!-- Banner -->
          <div class="banner-section">
            <van-swipe :autoplay="3000" indicator-color="white" class="my-swipe">
              <van-swipe-item>
                <div class="banner-wrapper">
                  <!-- 使用占位图或实际图片 -->
                  <div class="banner-placeholder">
                    <div class="banner-text">
                      <div class="main-title">前庭功能检查基本方法与技术</div>
                      <div class="sub-title">手把手教你做耳石症、眼震电图...</div>
                    </div>
                    <div class="doctor-img">
                      <!-- 医生头像占位 -->
                      <span>徐帅</span>
                    </div>
                  </div>
                </div>
              </van-swipe-item>
            </van-swipe>
          </div>

          <!-- 金刚区 -->
          <van-grid :border="false" :column-num="5" class="grid-menu">
            <van-grid-item v-for="item in gridItems" :key="item.text" :text="item.text">
              <template #icon>
                <div class="grid-icon" :style="{ backgroundColor: item.color }">
                  <van-icon :name="item.icon" color="#fff" size="20" />
                </div>
              </template>
            </van-grid-item>
          </van-grid>

          <!-- 为您推荐 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">为您推荐</span>
              <span class="section-more">更多 <van-icon name="arrow" /></span>
            </div>
            <div class="horizontal-scroll">
              <div class="course-card" v-for="item in recommendItems" :key="item.id">
                <div class="course-img bg-blue">
                  <span class="tag">精品课</span>
                  <div class="course-text">{{ item.title }}</div>
                </div>
                <div class="course-info">
                  <div class="course-name">{{ item.name }}</div>
                  <div class="course-price">{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 新品专区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">新品专区</span>
              <span class="section-more">更多 <van-icon name="arrow" /></span>
            </div>
            <div class="grid-layout">
              <div class="course-card-lg" v-for="item in newItems" :key="item.id">
                <div class="course-img-lg" :class="item.bgClass">
                  <span class="tag">精品课</span>
                  <div class="course-text-lg">{{ item.title }}</div>
                </div>
                <div class="course-info-lg">
                  <div class="course-name-lg">{{ item.name }}</div>
                  <div class="course-author">{{ item.author }}</div>
                  <div class="course-price">{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 专栏 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">专栏</span>
              <span class="section-more">更多 <van-icon name="arrow" /></span>
            </div>
            <div class="horizontal-scroll">
              <div class="column-card" v-for="item in columnItems" :key="item.id">
                <div class="column-icon">
                  <van-icon :name="item.icon" size="24" :color="item.color" />
                </div>
                <div class="column-info">
                  <div class="column-name">{{ item.name }}</div>
                  <div class="column-follow">{{ item.follow }}人关注</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-text">已显示全部内容</div>
        </div>
      </van-tab>
      <van-tab title="儿科">
        <div class="empty-placeholder">儿科内容建设中...</div>
      </van-tab>
      <!-- 其他Tab -->
      <template #nav-right>
         <div class="tab-filter">
           <van-icon name="wap-nav" size="20" />
         </div>
      </template>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchText = ref('');
const activeTab = ref(0);

const onClickLeft = () => {
  router.back();
};

const gridItems = [
  { text: '临床必备', icon: 'hotel-o', color: '#5c9aff' },
  { text: '科研论文', icon: 'column', color: '#ffbd2d' },
  { text: '外文课程', icon: 'font-o', color: '#5c9aff' },
  { text: '精选合集', icon: 'star-o', color: '#00c49f' },
  { text: '指南解读', icon: 'compass-o', color: '#00c49f' },
];

const recommendItems = [
  { id: 1, title: '儿童肺炎支原体耐药特点与大环内酯的合理应用', name: '儿童肺炎支原体耐药特点与大环内酯的合...', price: '免费' },
  { id: 2, title: '克拉霉素在小儿呼吸道感染中的应用', name: '克拉霉素在小儿呼吸道感染中的应用', price: '免费' },
  { id: 3, title: '儿童社区获得性肺炎诊疗与规范', name: '儿童社区获得性肺炎诊疗与规范', price: '免费' },
];

const newItems = [
  { id: 1, title: '青少年抑郁障碍的临床特征和治疗决策', name: '青少年抑郁障碍的临床特征和...', author: '张欣', price: '免费', bgClass: 'bg-green' },
  { id: 2, title: '青少年情绪障碍病例分享', name: '青少年情绪障碍病例分享', author: '戚洪莉 | 主治医师', price: '免费', bgClass: 'bg-orange' },
  { id: 3, title: '重回光明：15岁女生的疗愈之路', name: '重回光明：15岁女生的疗愈之路', author: '茅荣杰 | 副主任医师', price: '免费', bgClass: 'bg-purple' },
  { id: 4, title: '青少年抑郁障碍的临床特征与治疗决策', name: '青少年抑郁障碍的临床特征与...', author: '赵鹏 教授 | 副主任医师', price: '免费', bgClass: 'bg-dark-blue' },
];

const columnItems = [
  { id: 1, name: '国际临研', follow: 235, icon: 'cluster-o', color: '#1989fa' },
  { id: 2, name: '医考资讯', follow: 170, icon: 'checked', color: '#ff976a' },
  { id: 3, name: '李主任', follow: 4, icon: 'manager', color: '#07c160' },
];

</script>

<style scoped>
.knowledge-bank {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 20px;
}

.custom-search {
  padding: 10px 12px;
}

.banner-section {
  padding: 0 12px;
  margin-top: 10px;
}

.my-swipe .van-swipe-item {
  border-radius: 8px;
  overflow: hidden;
}

.banner-wrapper {
  background: linear-gradient(to right, #e8f5e9, #c8e6c9);
  height: 120px;
  position: relative;
  padding: 15px;
  display: flex;
  align-items: center;
}

.banner-placeholder {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-text .main-title {
  font-size: 16px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 5px;
}

.banner-text .sub-title {
  font-size: 12px;
  color: #388e3c;
}

.doctor-img {
  width: 80px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-weight: bold;
}

.grid-menu {
  margin-top: 15px;
}

.grid-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.section {
  margin-top: 20px;
  padding: 0 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
}

/* Horizontal Scroll */
.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
}

.horizontal-scroll::-webkit-scrollbar {
  display: none;
}

.course-card {
  flex: 0 0 150px;
  margin-right: 10px;
}

.course-img {
  height: 90px;
  border-radius: 6px;
  padding: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.bg-blue { background-color: #1989fa; color: white; }
.bg-green { background-color: #07c160; color: white; }
.bg-orange { background-color: #ff976a; color: white; }
.bg-purple { background-color: #7232dd; color: white; }
.bg-dark-blue { background-color: #0d47a1; color: white; }

.tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255,255,255,0.2);
  font-size: 10px;
  padding: 2px 4px;
  border-bottom-right-radius: 6px;
}

.course-text {
  font-size: 12px;
  font-weight: bold;
  line-height: 1.4;
}

.course-info {
  margin-top: 8px;
}

.course-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-price {
  font-size: 14px;
  color: #ff9800;
  font-weight: bold;
  margin-top: 4px;
}

/* Grid Layout for New Items */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.course-card-lg {
  background-color: #fff;
}

.course-img-lg {
  height: 100px;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.course-text-lg {
  font-size: 13px;
  font-weight: bold;
  color: white;
  line-height: 1.4;
}

.course-info-lg {
  margin-top: 8px;
}

.course-name-lg {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-author {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

/* Column Card */
.column-card {
  flex: 0 0 130px;
  margin-right: 10px;
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.column-icon {
  margin-bottom: 8px;
}

.column-name {
  font-size: 14px;
  color: #333;
  font-weight: bold;
  margin-bottom: 4px;
}

.column-follow {
  font-size: 12px;
  color: #999;
}

.footer-text {
  text-align: center;
  color: #ccc;
  font-size: 12px;
  padding: 20px 0;
}

.empty-placeholder {
  padding: 50px;
  text-align: center;
  color: #999;
}

.tab-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  height: 100%;
  background-color: #fff;
}
</style>
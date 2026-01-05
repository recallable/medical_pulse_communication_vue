<template>
  <div class="knowledge-bank">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="知识银行" left-arrow @click-left="onClickLeft">
      <template #right>
        <van-icon name="manager-o" size="18" color="#333" />
      </template>
    </van-nav-bar>

    <!-- 搜索框 -->
    <van-search v-model="searchText" shape="round" placeholder="搜索您感兴趣的课程" class="custom-search" />

    <!-- 标签页 -->
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
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

          <!-- 为你推荐 -->
          <div class="section-container">
            <div class="section-header">
              <span class="section-title">为你推荐</span>
              <span class="section-more" @click="handleRefreshRec">
                换一批 <van-icon name="replay" />
              </span>
            </div>
            <div class="recommend-grid">
              <van-loading v-if="recLoading" class="rec-loading" vertical>加载推荐中...</van-loading>
              <div v-else-if="recommendList.length === 0" class="empty-rec">暂无推荐，快去浏览课程吧</div>
              <div v-else class="course-card" v-for="item in recommendList" :key="item.course_id"
                @click="handleRecClick(item.course_id)">
                <div class="course-img-sm">
                  <span class="tag-rec" v-if="item.recommendation_reason">{{ item.recommendation_reason }}</span>
                </div>
                <div class="course-info-sm">
                  <div class="course-name-sm">{{ item.course_name }}</div>
                  <div class="course-meta-sm">
                    <span class="dept-tag">{{ item.medical_department }}</span>
                    <span class="level-tag">{{ difficultyMap[item.difficulty_level] || '通用' }}</span>
                  </div>
                  <div class="course-price-sm">¥{{ item.price }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 新品专区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-title">新品专区</span>
              <span class="section-more" @click="goToCourseList">更多 <van-icon name="arrow" /></span>
            </div>
            <div class="grid-layout">
              <div class="course-card-lg" v-for="item in newItems" :key="item.id" @click="handleCourseClick(item.id)">
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
      <van-tab v-for="dept in departments" :key="dept" :title="dept">
        <div class="dept-content">
          <van-list v-model:loading="listLoading" :finished="listFinished" finished-text="没有更多了"
            :immediate-check="false" @load="onDeptLoad">
            <van-loading v-if="deptLoading" size="24px" vertical class="loading-wrapper">加载中...</van-loading>
            <div v-else-if="deptCourses.length === 0 && !listLoading" class="empty-placeholder">暂无{{ dept }}相关课程</div>
            <div v-else class="grid-layout">
              <div class="course-card-lg" v-for="item in deptCourses" :key="item.id"
                @click="handleCourseClick(item.id)">
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
          </van-list>
        </div>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCourseList } from '@/api/knowledge';
import type { MedicalCourseResponse } from '@/api/knowledge';
import { useRecommendation } from '@/composables/useRecommendation';

const router = useRouter();
const { recommendList, loading: recLoading, loadRecommendations, refreshRecommendations, trackAction } = useRecommendation();

const searchText = ref('');
const activeTab = ref(0);

const onClickLeft = () => {
  router.back();
};

const goToCourseList = () => {
  router.push('/app/knowledge/list');
};

const gridItems = [
  { text: '临床必备', icon: 'hotel-o', color: '#5c9aff' },
  { text: '科研论文', icon: 'column', color: '#ffbd2d' },
  { text: '外文课程', icon: 'font-o', color: '#5c9aff' },
  { text: '精选合集', icon: 'star-o', color: '#00c49f' },
  { text: '指南解读', icon: 'compass-o', color: '#00c49f' },
];

// 难度等级映射
const difficultyMap: Record<number, string> = {
  1: '入门',
  2: '进阶',
  3: '高阶',
  4: '专家'
};

const handleRecClick = (id: number) => {
  trackAction(id, 'view'); // 点击时埋点 view
  // 实际跳转逻辑，暂用 Toast 模拟或跳转到详情页
  // router.push(`/app/knowledge/course/${id}`);
};

const handleCourseClick = (courseId: number) => {
  trackAction(courseId, 'view'); // 点击时埋点 view
  // 跳转详情页
  // router.push(`/app/knowledge/course/${courseId}`);
};

const handleRefreshRec = () => {
  refreshRecommendations();
};

onMounted(() => {
  loadNewCourses();
  loadRecommendations(); // 加载推荐
});

interface NewItem {
  id: number;
  title: string;
  name: string;
  author: string;
  price: string;
  bgClass: string;
}
// 推荐区域暂时为空
const recommendItems = ref<NewItem[]>([
  { id: 1, title: '临床必备', name: '临床必备', author: '名医团队', price: '免费', bgClass: 'bg-green' },
  { id: 2, title: '科研论文', name: '科研论文', author: '名医团队', price: '免费', bgClass: 'bg-orange' },
  { id: 3, title: '外文课程', name: '外文课程', author: '名医团队', price: '免费', bgClass: 'bg-purple' },
  { id: 4, title: '精选合集', name: '精选合集', author: '名医团队', price: '免费', bgClass: 'bg-dark-blue' },
]);



const newItems = ref<NewItem[]>([]);
const deptCourses = ref<NewItem[]>([]);
const deptLoading = ref(false);
const listLoading = ref(false);
const listFinished = ref(false);
const cursorId = ref(0);

const onTabChange = (index: number) => {
  // index 0 是“推荐”Tab
  if (index === 0) return;

  // 重置状态
  deptCourses.value = [];
  cursorId.value = 0;
  listFinished.value = false;
  deptLoading.value = true;
  listLoading.value = false;

  // 立即加载第一页
  onDeptLoad();
};

const onDeptLoad = async () => {
  // 获取科室名称（departments 数组下标需减1，因为 Tab 0 是推荐）
  const deptName = departments[activeTab.value - 1];
  if (!deptName) {
    deptLoading.value = false;
    listLoading.value = false;
    return;
  }

  try {
    const res = await getCourseList({
      id: cursorId.value,
      medical_department: deptName,
      limit: 10, // 每次加载10条
      order_by: 'id'
    });

    if (res.data && res.data.code === 200) {
      const data = res.data.data;
      const courses = Array.isArray(data) ? data : (data as any).news || [];

      const bgClasses = ['bg-green', 'bg-orange', 'bg-purple', 'bg-dark-blue'];
      const newCourses = courses.map((course: any, idx: number) => ({
        id: course.id,
        title: course.course_name,
        name: course.course_name,
        author: course.applicable_title || '名医团队',
        price: Number(course.price) === 0 ? '免费' : `¥${course.price}`,
        bgClass: bgClasses[idx % bgClasses.length]
      }));

      if (newCourses.length > 0) {
        deptCourses.value.push(...newCourses);
        // 更新游标
        cursorId.value = courses[courses.length - 1].id;
      }

      // 如果返回少于 limit，说明没有更多了
      if (courses.length < 10) {
        listFinished.value = true;
      }
    } else {
      listFinished.value = true;
    }
  } catch (error) {
    console.error(`加载${deptName}课程失败`, error);
    listFinished.value = true;
  } finally {
    deptLoading.value = false;
    listLoading.value = false;
  }
};

const loadNewCourses = async () => {
  try {
    const res = await getCourseList({ limit: 4, order_by: '-created_time' });
    // 注意：根据 request.ts 的封装，这里可能直接返回 data 或者 response
    // 假设 request.post 返回的是 ResponseData<T>，其中 data 字段是 T
    // 我们的 API 定义返回 ResponseData<{ news: MedicalCourseResponse[] }>
    // 所以 res.data 是 { news: ... }
    // 如果 request 拦截器直接返回 data.data，需要确认 utils/request
    // 通常 axios 返回 response，response.data 是后端返回的 json
    // 假设 utils/request 做了处理，我们先按标准 axios 响应处理，或者参考 home.ts
    // home.ts: const res = await ...; if (res.data.code === 200) ...
    // 所以 res 是 axios response对象
    if (res.data && res.data.code === 200) {
      const data = res.data.data;
      // 兼容直接返回列表或返回对象包含news字段的情况
      const courses = Array.isArray(data) ? data : (data as any).news || [];

      const bgClasses = ['bg-green', 'bg-orange', 'bg-purple', 'bg-dark-blue'];
      newItems.value = courses.map((course: any, index: number) => ({
        id: course.id,
        title: course.course_name,
        name: course.course_name, // 暂时 title 和 name 用同一个
        author: course.applicable_title || '名医团队',
        price: Number(course.price) === 0 ? '免费' : `¥${course.price}`,
        bgClass: bgClasses[index % bgClasses.length]
      }));
    }
  } catch (error) {
    console.error('加载课程失败', error);
  }
};

onMounted(() => {
  loadNewCourses();
});

const columnItems = [
  { id: 1, name: '国际临研', follow: 235, icon: 'cluster-o', color: '#1989fa' },
  { id: 2, name: '医考资讯', follow: 170, icon: 'checked', color: '#ff976a' },
  { id: 3, name: '李主任', follow: 4, icon: 'manager', color: '#07c160' },
];

const departments = [
  '心内科', '呼吸内科', '消化内科', '神经内科',
  '骨科', '妇产科', '儿科', '急诊科',
  '内分泌科', '皮肤科'
];

</script>

<style scoped>
.loading-wrapper {
  padding: 40px 0;
  text-align: center;
}

.dept-content {
  padding: 12px;
  min-height: 200px;
}

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

.bg-blue {
  background-color: #1989fa;
  color: white;
}

.bg-green {
  background-color: #07c160;
  color: white;
}

.bg-orange {
  background-color: #ff976a;
  color: white;
}

.bg-purple {
  background-color: #7232dd;
  color: white;
}

.bg-dark-blue {
  background-color: #0d47a1;
  color: white;
}

.tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.2);
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
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.rec-loading {
  grid-column: span 2;
  padding: 20px 0;
}

.empty-rec {
  grid-column: span 2;
  text-align: center;
  color: #999;
  padding: 20px 0;
  font-size: 14px;
}

.course-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.course-img-sm {
  height: 80px;
  background: #eef2f7;
  position: relative;
  border-radius: 8px 8px 0 0;
}

.tag-rec {
  position: absolute;
  top: 0;
  left: 0;
  background: #ff976a;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px 0 8px 0;
}

.course-info-sm {
  padding: 8px;
}

.course-name-sm {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-meta-sm {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.dept-tag,
.level-tag {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
}

.dept-tag {
  background: #e8f4ff;
  color: #1989fa;
}

.level-tag {
  background: #fdf6ec;
  color: #e6a23c;
}

.course-price-sm {
  font-size: 14px;
  color: #ff502c;
  font-weight: bold;
}

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
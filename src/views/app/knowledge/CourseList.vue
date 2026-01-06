<template>
  <div class="course-list-page">
    <van-nav-bar title="课程列表" left-arrow @click-left="onClickLeft" fixed placeholder />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="course-list">
          <div v-for="(item, index) in list" :key="item.id" class="course-item" @click="goToDetail(item.id)">
            <div class="course-img" :class="getBgClass(index)">
              <span class="tag">精品课</span>
              <div class="course-text">{{ item.course_name }}</div>
            </div>
            <div class="course-info">
              <div class="course-name">{{ item.course_name }}</div>
              <div class="course-meta">
                <span class="author">{{ item.applicable_title || '名医团队' }}</span>
                <span class="dept" v-if="item.medical_department">{{ item.medical_department }}</span>
              </div>
              <div class="course-bottom">
                <div class="course-price">{{ Number(item.price) === 0 ? '免费' : `¥${item.price}` }}</div>
                <div class="course-sales">120人已学</div>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCourseList } from '@/api/knowledge';
import type { MedicalCourseResponse } from '@/api/knowledge';
import { showToast } from 'vant';

const router = useRouter();

const list = ref<MedicalCourseResponse[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const cursorId = ref(0); // 游标，默认为0

const bgClasses = ['bg-green', 'bg-orange', 'bg-purple', 'bg-dark-blue'];

const getBgClass = (index: number) => {
  return bgClasses[index % bgClasses.length];
};

const onClickLeft = () => {
  router.back();
};

const goToDetail = (id: number) => {
  router.push(`/app/knowledge/course/${id}`);
};

const onLoad = async () => {
  if (refreshing.value) {
    list.value = [];
    refreshing.value = false;
    cursorId.value = 0;
  }

  try {
    const res = await getCourseList({
      id: cursorId.value,
      limit: 10,
      order_by: 'id'
    });

    if (res.data && res.data.code === 200) {
      const data = res.data.data;
      // 兼容处理：支持直接返回数组或对象包含 news 字段
      const items = Array.isArray(data) ? data : (data as any).news || [];

      if (items.length > 0) {
        list.value.push(...items);
        // 更新游标为最后一条数据的ID
        cursorId.value = items[items.length - 1].id;
      }

      // 如果返回数据少于 limit，说明没有更多数据了
      if (items.length < 10) {
        finished.value = true;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    console.error('加载课程列表失败', error);
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => {
  // 重置状态
  finished.value = false;
  loading.value = true;
  onLoad();
};
</script>

<style scoped>
.course-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.course-list {
  padding: 12px;
}

.course-item {
  display: flex;
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.course-img {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  margin-right: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;
}

.course-text {
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  padding: 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-bottom-right-radius: 6px;
}

.bg-blue {
  background-color: #1989fa;
}

.bg-green {
  background-color: #07c160;
}

.bg-orange {
  background-color: #ff976a;
}

.bg-purple {
  background-color: #7232dd;
}

.bg-dark-blue {
  background-color: #0d47a1;
}

.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.course-name {
  font-size: 15px;
  color: #333;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
}

.author {
  margin-right: 8px;
}

.dept {
  background-color: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #666;
}

.course-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.course-price {
  color: #ff9800;
  font-size: 14px;
  font-weight: bold;
}

.course-sales {
  font-size: 11px;
  color: #ccc;
}
</style>

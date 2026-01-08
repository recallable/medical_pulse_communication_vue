<template>
    <div class="course-detail">
        <van-nav-bar title="课程详情" left-arrow @click-left="onClickLeft" fixed placeholder>
            <template #right>
                <van-icon name="share-o" size="18" />
            </template>
        </van-nav-bar>

        <div v-if="loading" class="loading-container">
            <van-loading vertical>加载中...</van-loading>
        </div>

        <div v-else-if="detail" class="content">
            <!-- Cover -->
            <div class="course-cover">
                <van-image width="100%" height="210" fit="cover"
                    src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
            </div>

            <!-- Info -->
            <div class="info-section">
                <h1 class="title">{{ detail.course_name }}</h1>
                <div class="meta-row">
                    <span class="author">{{ detail.ext_info?.cooperative_institution || '名医团队' }} {{
                        detail.applicable_title
                    }}</span>
                    <span class="lessons">共{{ detail.class_hours }}课时</span>
                </div>
                <div class="price-row">
                    <span class="price">¥{{ detail.price }}</span>
                    <span class="original-price">¥{{ (Number(detail.price) * 1.5).toFixed(2) }}</span>
                    <span class="students">2623人正在学习</span>
                </div>
            </div>

            <!-- Tabs -->
            <van-tabs v-model:active="activeTab" sticky>
                <van-tab title="简介">
                    <div class="tab-content intro">
                        <h3>课程介绍</h3>
                        <div class="desc">{{ detail.course_desc }}</div>
                        <div class="tags">
                            <van-tag v-for="tag in detail.ext_info?.course_tags" :key="tag" plain type="primary"
                                class="mr-2">{{
                                    tag }}</van-tag>
                        </div>

                        <h3>课程亮点</h3>
                        <van-image width="100%" height="150" radius="8"
                            src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg" class="mb-2" />
                        <van-image width="100%" height="150" radius="8"
                            src="https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg" />
                    </div>
                </van-tab>
                <van-tab title="目录">
                    <div class="tab-content catalog">
                        <van-cell-group>
                            <van-cell title="01. 课程导论与学习指南" label="10:00 | 免费试听" is-link />
                            <van-cell title="02. 基础理论与核心概念" label="45:00" is-link />
                            <van-cell title="03. 临床实操演示（一）" label="30:20" is-link />
                            <van-cell title="04. 临床实操演示（二）" label="35:10" is-link />
                            <van-cell title="05. 典型病例深度解析" label="28:45" is-link />
                            <van-cell title="06. 专家答疑与互动" label="20:00" is-link />
                        </van-cell-group>
                    </div>
                </van-tab>
                <van-tab title="评价">
                    <CourseComment :course-id="courseId" />
                </van-tab>
            </van-tabs>
        </div>

        <!-- Bottom Bar -->
        <div v-if="detail" class="custom-action-bar">
            <div class="action-item" @click="handleConsult">
                <van-icon name="service-o" size="20" />
                <span class="action-text">立即咨询</span>
            </div>
            <div class="action-item" @click="toggleFavorite">
                <van-icon :name="isFavorited ? 'star' : 'star-o'" :color="isFavorited ? '#ff5000' : ''" size="20" />
                <span class="action-text">收藏</span>
            </div>
            <div class="action-button" @click="handlePurchase">
                <span>{{ isPurchased ? '立即学习' : '立即购买' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCourseDetail } from '@/api/knowledge';
import type { CourseDetailResponse } from '@/api/knowledge';
import { useRecommendation } from '@/composables/useRecommendation';
import { showToast } from 'vant';
import CourseComment from './components/CourseComment.vue';

const route = useRoute();
const router = useRouter();
const { trackAction } = useRecommendation();

const loading = ref(true);
const detail = ref<CourseDetailResponse['course_detail'] | null>(null);
const activeTab = ref(0);
const isFavorited = ref(false);

const courseId = Number(route.params.id);

const onClickLeft = () => {
    router.back();
};

const isPurchased = ref(false);

const fetchDetail = async () => {
    try {
        const res = await getCourseDetail(courseId);
        if (res.data.code === 200) {
            detail.value = res.data.data.course_detail;
            isPurchased.value = res.data.data.exist;
        }
    } catch (error) {
        console.error(error);
        showToast('加载课程详情失败');
    } finally {
        loading.value = false;
    }
};

const toggleFavorite = () => {
    isFavorited.value = !isFavorited.value;
    const action = isFavorited.value ? 'favorite' : 'unfavorite';
    trackAction(courseId, action);
    showToast(isFavorited.value ? '已收藏' : '已取消收藏');
};

/**
 * 处理咨询按钮点击
 */
const handleConsult = (): void => {
    trackAction(courseId, 'consult');
    showToast('正在跳转至咨询页面...');
};

const handleStudy = () => {
    // 跳转到学习页面或播放页面
    showToast('跳转到学习页面');
};

/**
 * 处理购买按钮点击
 */
const handlePurchase = (): void => {
    if (!detail.value) return;

    if (isPurchased.value) {
        handleStudy();
        return;
    }

    router.push({
        path: '/app/knowledge/checkout',
        query: {
            courseId: detail.value.id,
            courseName: detail.value.course_name,
            price: detail.value.price,
            originalPrice: (Number(detail.value.price) * 1.5).toFixed(2),
            author: detail.value.ext_info?.cooperative_institution || detail.value.applicable_title || '名医团队'
        }
    });
};

onMounted(() => {
    if (courseId) {
        fetchDetail();
        trackAction(courseId, 'view');
    }
});
</script>

<style scoped>
.course-detail {
    min-height: 100vh;
    background: #f7f8fa;
    padding-bottom: 50px;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding-top: 50px;
}

.content {
    background: #fff;
}

.info-section {
    padding: 16px;
    background: #fff;
    margin-bottom: 10px;
}

.title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
    line-height: 1.4;
    color: #333;
}

.meta-row {
    font-size: 13px;
    color: #666;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
}

.price-row {
    display: flex;
    align-items: baseline;
}

.price {
    font-size: 24px;
    color: #ff5000;
    font-weight: bold;
    margin-right: 8px;
}

.original-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    margin-right: auto;
}

.students {
    font-size: 12px;
    color: #999;
}

.tab-content {
    padding: 16px;
    background: #fff;
    min-height: 300px;
}

.intro h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    border-left: 4px solid #1989fa;
    padding-left: 8px;
}

.intro .desc {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 16px;
    text-align: justify;
}

.tags {
    margin-bottom: 16px;
}

.mr-2 {
    margin-right: 8px;
}

.mb-2 {
    margin-bottom: 8px;
}

/* 评价样式 */
.review-item {
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
    margin-bottom: 16px;
}

.review-user {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.username {
    font-size: 14px;
    font-weight: bold;
    color: #333;
}

.review-text {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.5;
}

.review-date {
    font-size: 12px;
    color: #999;
}

/* 自定义底部操作栏 */
.custom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    padding: 8px 16px;
    z-index: 999;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 80px;
    cursor: pointer;
}

.action-text {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
}

.action-button {
    flex: 1;
    margin-left: 12px;
    background: linear-gradient(to right, #ff6034, #ee0a24);
    border-radius: 22px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}
</style>

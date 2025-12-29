<template>
    <div class="mine-page">
        <!-- 顶部状态栏区域 -->
        <div class="header-section">
            <div class="top-icons">
                <van-icon name="scan" size="24" />
                <van-badge dot>
                    <van-icon name="bell" size="24" />
                </van-badge>
            </div>

            <!-- 用户信息卡片 -->
            <div class="user-card">
                <div class="user-info">
                    <van-image round width="60" height="60" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
                        class="avatar" />
                    <div class="user-details">
                        <div class="user-name">
                            {{ userInfo.username }}
                            <van-icon name="arrow" />
                        </div>
                        <div class="user-id">
                            <span class="id-tag" @click="handleCertification"
                                :class="{ 'certified': userInfo.is_certified }">
                                {{ userInfo.is_certified ? '已认证' : '未认证' }}
                            </span>
                            手机号 {{ userInfo.phone }} <van-icon name="description" />
                        </div>
                    </div>
                </div>

                <!-- 麦粒积分 -->
                <div class="points-bar">
                    <div class="points-text">
                        <span class="points-num">1</span> 麦粒 <span class="divider">|</span> 获取麦粒可兑换好礼哦~
                    </div>
                    <van-button size="mini" round color="#ff6b00" class="exchange-btn">去兑换 <van-icon
                            name="arrow" /></van-button>
                </div>
            </div>
        </div>

        <!-- 会员卡片滑动区 -->
        <div class="vip-scroll-area">
            <div class="vip-card">
                <div class="vip-icon compass-icon">
                    <van-icon name="compass" />
                </div>
                <div class="vip-content">
                    <div class="vip-title">开通指南会员 <van-icon name="arrow" /></div>
                    <div class="vip-desc">精品指南免费阅读</div>
                </div>
            </div>
            <div class="vip-card">
                <div class="vip-icon med-icon">
                    <van-icon name="medal" />
                </div>
                <div class="vip-content">
                    <div class="vip-title">开通用药会员 <van-icon name="arrow" /></div>
                    <div class="vip-desc">畅享说明书、用药须知</div>
                </div>
            </div>
            <!-- 占位，模拟滚动 -->
            <div class="vip-card" style="width: 20px; flex: none; background: transparent;"></div>
        </div>

        <!-- 常用功能 -->
        <div class="common-functions">
            <van-grid :column-num="4" :border="false">
                <van-grid-item icon="star" text="我的收藏" icon-color="#5c9aff" />
                <van-grid-item icon="clock" text="浏览历史" icon-color="#00c49f" />
                <van-grid-item icon="play-circle" text="我的课程" icon-color="#9a66ff" />
                <van-grid-item icon="guide-o" text="我的指南" icon-color="#00c49f" />
            </van-grid>
        </div>

        <!-- 更多服务 -->
        <div class="section-container">
            <div class="section-title">更多服务</div>
            <van-grid :column-num="4" :border="false">
                <van-grid-item icon="wap-home-o" :text="text" @click="handleStudio" />
                <van-grid-item icon="notes-o" text="我的帖子" />
                <van-grid-item icon="comment-o" text="我的评论" />
                <van-grid-item icon="bill-o" text="发票中心" />
                <van-grid-item icon="shop-o" text="麦粒商城" />
                <van-grid-item icon="todo-list-o" text="麦粒任务" />
                <van-grid-item icon="coupon-o" text="卡券中心" />
                <van-grid-item icon="friends-o" text="我的好友" @click="handleFriends" />
                <van-grid-item icon="shield-o" text="申请认证" @click="handleCertification" />
            </van-grid>
        </div>

        <!-- 医脉通小程序 -->
        <div class="section-container">
            <div class="section-title">医脉通小程序</div>
            <van-grid :column-num="5" :border="false">
                <van-grid-item icon="compass-o" text="临床指南" icon-color="#2cbfbf" />
                <van-grid-item icon="cluster-o" text="医知源" icon-color="#4caf50" />
                <van-grid-item icon="chart-trending-o" text="医学公式" icon-color="#2196f3" />
                <van-grid-item icon="orders-o" text="医学文献王" icon-color="#ff9800" />
                <van-grid-item icon="passed" text="医学助考" icon-color="#ff5722" />
            </van-grid>
        </div>

        <!-- 列表菜单 -->
        <div class="menu-list">
            <van-cell-group inset>
                <van-cell title="设置" is-link icon="setting-o" />
                <van-cell title="帮助中心" is-link icon="question-o" />
                <van-cell title="反馈/举报" is-link icon="edit" />
                <van-cell title="推荐医学软件" is-link icon="apps-o" />
            </van-cell-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userInfo = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'))

const text = computed(() => {
    return userInfo.userIdentity === 1 ? '工作室' : '智能问诊';
});

const handleStudio = () => {
    router.push('/app/studio');
};

const handleCertification = () => {
    if (userInfo.is_certified) {
        // 已认证 -> 跳转到详情页
        router.push('/app/certification/detail');
    } else {
        // 未认证 -> 跳转到申请页
        router.push('/app/certification/apply');
    }
};

const handleFriends = () => {
    router.push('/friend/list');
};

</script>

<style scoped>
.mine-page {
    background-color: #f7f8fa;
    min-height: 100vh;
    padding-bottom: 20px;
}

.header-section {
    background: #fff;
    padding: 16px;
    padding-bottom: 0;
}

.top-icons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.user-card {
    margin-bottom: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.avatar {
    margin-right: 12px;
    border: 1px solid #eee;
}

.user-name {
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
}

.user-id {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
    display: flex;
    align-items: center;
}

.id-tag {
    background: #eee;
    padding: 1px 4px;
    border-radius: 4px;
    margin-right: 6px;
    font-size: 10px;
    cursor: pointer;
}

.id-tag.certified {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
}

.points-bar {
    background: linear-gradient(to right, #fff5e6, #fff);
    padding: 10px 12px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.points-text {
    font-size: 12px;
    color: #666;
}

.points-num {
    color: #ff6b00;
    font-weight: bold;
    font-size: 14px;
}

.divider {
    margin: 0 4px;
    color: #ddd;
}

/* 会员卡片滚动区 */
.vip-scroll-area {
    display: flex;
    overflow-x: auto;
    padding: 0 16px 16px;
    background: #fff;
    gap: 10px;
    /* 隐藏滚动条 */
    scrollbar-width: none;
}

.vip-scroll-area::-webkit-scrollbar {
    display: none;
}

.vip-card {
    flex: 0 0 160px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    align-items: center;
}

.vip-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: #fff;
}

.compass-icon {
    background: #ffaa00;
}

.med-icon {
    background: #ff8800;
}

.vip-content {
    flex: 1;
}

.vip-title {
    font-size: 13px;
    font-weight: bold;
    display: flex;
    align-items: center;
}

.vip-desc {
    font-size: 10px;
    color: #999;
    margin-top: 2px;
}

.common-functions {
    background: #fff;
    margin-bottom: 12px;
    padding-bottom: 12px;
}

.section-container {
    background: #fff;
    margin: 12px;
    border-radius: 8px;
    padding: 12px 0;
}

.section-title {
    font-size: 15px;
    font-weight: bold;
    padding: 0 16px 8px;
}

.menu-list {
    margin: 12px 0;
}

:deep(.van-grid-item__content) {
    padding: 12px 8px;
}

:deep(.van-grid-item__text) {
    font-size: 12px;
    color: #333;
}
</style>

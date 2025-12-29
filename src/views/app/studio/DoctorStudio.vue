<template>
    <div class="doctor-studio">
        <van-nav-bar title="医脉通工作室">
            <template #right>
                <van-icon name="bell" size="18" />
            </template>
        </van-nav-bar>

        <!-- 头部个人信息 -->
        <div class="header-card">
            <div class="user-info">
                <div class="avatar-wrapper">
                    <van-image round width="60" height="60"
                        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
                </div>
                <div class="info-content">
                    <div class="name-row">
                        <span class="name">{{ userInfo.real_name || '医师' }}</span>
                        <span class="id-badge">证</span>
                    </div>
                    <div class="verify-status" @click="goToCertification">
                        <span>{{ isCertified ? '已认证' : '点击前往认证' }}</span>
                        <van-icon name="arrow" size="12" />
                    </div>
                </div>
                <div class="invite-btn">
                    <van-icon name="qr" />
                    <span>邀请患者</span>
                </div>
            </div>

            <!-- 数据概览 -->
            <div class="stats-row">
                <div class="stats-card">
                    <div class="icon-wrapper blue">
                        <van-icon name="plus" />
                    </div>
                    <div class="stats-info">
                        <span class="label">待接诊</span>
                        <span class="value">0</span>
                    </div>
                </div>
                <div class="stats-card">
                    <div class="icon-wrapper green">
                        <van-icon name="chat-o" />
                    </div>
                    <div class="stats-info">
                        <span class="label">待回复</span>
                        <span class="value">0</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 功能九宫格 -->
        <div class="menu-grid">
            <van-grid :column-num="4" :border="false">
                <van-grid-item icon="friends" text="我的患者" icon-color="#ff976a" />
                <van-grid-item icon="records" text="处方管理" icon-color="#07c160" />
                <van-grid-item icon="cluster" text="基因检测" icon-color="#1989fa" />
                <van-grid-item icon="setting" text="问诊设置" icon-color="#07c160" />
                <van-grid-item icon="question" text="问答专区" icon-color="#ff976a" />
                <van-grid-item icon="add-square" text="患者招募" icon-color="#1989fa" />
                <van-grid-item icon="user-circle-o" text="个人中心" icon-color="#7232dd" />
            </van-grid>
        </div>

        <!-- Banner -->
        <div class="banner-area">
            <div class="banner-content">
                <div class="banner-text">
                    <h3>银川医脉通互联网医院</h3>
                    <p>自治区卫生热线 0951-12320</p>
                    <p>银川市政府热线 0951-12345</p>
                </div>
                <div class="doctor-img">
                    <van-icon name="manager" size="80" color="#1989fa" />
                </div>
            </div>
        </div>

        <!-- 认证进度卡片 -->
        <div class="certification-card" v-if="!isCertified">
            <div class="cert-content">
                <h3>认证进度</h3>
                <p>您尚未进行互联网医院执业医师认证，根据相关法律法规，您不能进行在线出诊与在线处方。</p>
            </div>
            <van-button size="small" round color="#d4b178" class="cert-btn" @click="goToCertification">
                点击认证
            </van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userInfo = ref<any>({});
const isCertified = ref(false); // 模拟认证状态

onMounted(() => {
    const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedUser) {
        try {
            userInfo.value = JSON.parse(storedUser);
            // 可以在这里根据 userInfo 的某些字段判断是否已认证
            // isCertified.value = userInfo.value.certified === 1;
        } catch (e) {
            console.error('UserInfo parse error', e);
        }
    }
});

const goToCertification = () => {
    // 根据实际路由跳转
    if (isCertified.value) {
        router.push('/app/certification/detail');
    } else {
        router.push('/app/certification/apply');
    }
};
</script>

<style scoped>
.doctor-studio {
    min-height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: 50px;
}

.header-card {
    background: linear-gradient(to bottom, #e6f7ff, #ffffff);
    padding: 20px 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 24px;
}

.avatar-wrapper {
    margin-right: 12px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-content {
    flex: 1;
}

.name-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
}

.name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-right: 8px;
}

.id-badge {
    background-color: #eee;
    color: #999;
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 4px;
}

.verify-status {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 12px;
}

.invite-btn {
    background-color: #e8f3ff;
    color: #1989fa;
    padding: 6px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
}

.stats-row {
    display: flex;
    gap: 12px;
}

.stats-card {
    flex: 1;
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}

.icon-wrapper {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: #fff;
}

.icon-wrapper.blue {
    background-color: #bfbfbf;
    /* 原型图中是灰色底加个加号 */
}

.icon-wrapper.green {
    background-color: #bfbfbf;
}

.stats-info {
    display: flex;
    flex-direction: column;
}

.stats-info .label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.stats-info .value {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.menu-grid {
    margin: 16px 0;
    background: #fff;
}

.banner-area {
    margin: 16px;
    background-color: #e0f2f1;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
}

.banner-content {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
}

.banner-text h3 {
    color: #00796b;
    font-size: 16px;
    margin: 0 0 8px 0;
}

.banner-text p {
    color: #009688;
    font-size: 12px;
    margin: 2px 0;
}

.certification-card {
    margin: 16px;
    background: linear-gradient(to right, #fff7e6, #fffbf2);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.cert-content {
    flex: 1;
    margin-right: 12px;
}

.cert-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #5c3a00;
}

.cert-content p {
    margin: 0;
    font-size: 12px;
    color: #8c6d1f;
    line-height: 1.5;
}

.cert-btn {
    flex-shrink: 0;
    color: #5c3a00 !important;
    font-weight: bold;
}
</style>

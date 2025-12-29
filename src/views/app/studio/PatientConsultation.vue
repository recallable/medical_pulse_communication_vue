<template>
    <div class="patient-consultation">
        <van-nav-bar title="智能问诊" />

        <div class="chat-container" ref="chatContainerRef">
            <div v-for="(msg, index) in messageList" :key="index" class="message-item" :class="msg.role">
                <div class="avatar">
                    <van-image round width="40" height="40"
                        :src="msg.role === 'user' ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'" />
                </div>
                <div class="bubble">
                    {{ msg.content }}
                </div>
            </div>
        </div>

        <div class="input-area">
            <van-field v-model="inputValue" placeholder="请描述您的症状或问题..." :border="false" class="input-field"
                @keydown.enter.prevent="handleSend">
                <template #button>
                    <van-button size="small" type="primary" :loading="loading" @click="handleSend">发送</van-button>
                </template>
            </van-field>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { sendChatMessage } from '@/api/chat';
import type { ChatMessage } from '@/api/chat';
import { showToast } from 'vant';

const inputValue = ref('');
const loading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);
const messageList = ref<ChatMessage[]>([
    { role: 'assistant', content: '您好，我是您的智能健康助手。请告诉我您哪里不舒服？' }
]);

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainerRef.value) {
            chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
        }
    });
};

const handleSend = async () => {
    const content = inputValue.value.trim();
    if (!content) return;

    // 添加用户消息
    messageList.value.push({ role: 'user', content });
    inputValue.value = '';
    scrollToBottom();

    loading.value = true;
    try {
        // 调用 LLM 接口
        const res = await sendChatMessage(content);
        if (res.data.code === 200) {
            messageList.value.push({ role: 'assistant', content: res.data.data.reply });
        } else {
            // 如果接口失败，为了演示效果，可以模拟回复（实际项目请删除 mock 逻辑）
            messageList.value.push({ role: 'assistant', content: '抱歉，我现在无法回答您的问题，请稍后再试。' });
        }
    } catch (error) {
        console.error(error);
        showToast('网络请求失败');
        // 模拟回复，防止演示中断
        messageList.value.push({ role: 'assistant', content: '系统连接超时，请检查网络。' });
    } finally {
        loading.value = false;
        scrollToBottom();
    }
};

onMounted(() => {
    scrollToBottom();
});
</script>

<style scoped>
.patient-consultation {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7f8fa;
}

.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 70px;
    /* 留出输入框空间 */
}

.message-item {
    display: flex;
    margin-bottom: 16px;
    align-items: flex-start;
}

.message-item.user {
    flex-direction: row-reverse;
}

.avatar {
    margin: 0 8px;
}

.bubble {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 15px;
    line-height: 1.5;
    word-break: break-all;
}

.message-item.assistant .bubble {
    background-color: #fff;
    color: #333;
    border-top-left-radius: 2px;
}

.message-item.user .bubble {
    background-color: #1989fa;
    color: #fff;
    border-top-right-radius: 2px;
}

.input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    border-top: 1px solid #ebedf0;
    padding: 8px 0;
    padding-bottom: calc(8px + constant(safe-area-inset-bottom));
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    z-index: 99;
}

.input-field {
    padding: 0 16px;
}
</style>

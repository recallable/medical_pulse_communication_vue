<template>
  <div class="ai-chat-page">
    <van-nav-bar title="AI 智能助手" left-text="返回" left-arrow @click-left="onClickLeft" @click-right="showHistory = true">
      <template #right>
        <van-icon name="clock-o" size="18" />
      </template>
    </van-nav-bar>

    <!-- 聊天区域 -->
    <div class="chat-container" ref="chatContainerRef">
      <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.role">
        <div class="avatar">
          <van-image round width="40" height="40"
            :src="msg.role === 'user' ? 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' : 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'" />
        </div>
        <div class="content-wrapper">
          <div class="bubble">
            <div class="markdown-body" v-html="renderMessage(msg.content)" v-if="msg.role === 'assistant'"></div>
            <div style="white-space: pre-wrap;" v-else>{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div v-if="isStreaming" class="message-item assistant">
        <div class="avatar">
          <van-image round width="40" height="40" src="https://fastly.jsdelivr.net/npm/@vant/assets/logo.png" />
        </div>
        <div class="content-wrapper">
          <div class="bubble">
            <van-loading type="spinner" size="20px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <van-field v-model="inputValue" placeholder="请输入您的问题..." :border="false" class="input-field"
        @keydown.enter.prevent="handleSend">
        <template #button>
          <van-button size="small" type="primary" :loading="loading" @click="handleSend"
            :disabled="!inputValue.trim()">发送</van-button>
        </template>
      </van-field>
    </div>

    <!-- 历史会话侧边栏 -->
    <van-popup v-model:show="showHistory" position="right" :style="{ width: '70%', height: '100%' }">
      <div class="history-sidebar">
        <div class="sidebar-header">
          <h3>历史会话</h3>
          <van-button icon="plus" size="small" type="primary" plain @click="createNewSession">新对话</van-button>
        </div>
        <div class="session-list">
          <van-cell v-for="session in sessionList" :key="session.session_id" :title="session.last_message || '新会话'"
            :label="session.created_time" clickable @click="switchSession(session.session_id)"
            :class="{ 'active-session': currentSessionId === session.session_id }" />
          <van-empty v-if="sessionList.length === 0" description="暂无历史会话" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { createSession, getSessionList, getSessionMessages, chatStreamUrl } from '@/api/ai';
import type { AiMessage, AiSession } from '@/api/ai';
import MarkdownIt from "markdown-it"
const router = useRouter();
const inputValue = ref('');
const loading = ref(false);
const isStreaming = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);
const messages = ref<AiMessage[]>([]);
const currentSessionId = ref<string>('');
const showHistory = ref(false);
const sessionList = ref<AiSession[]>([]);
const md = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true
});

const renderMessage = (content: string) => {
  if (!content) return '';
  return md.render(content);
};



// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const onClickLeft = () => {
  router.back();
};

// 加载会话列表
const loadSessionList = async () => {
  try {
    const res = await getSessionList();
    if (res.data.code === 200) {
      sessionList.value = res.data.data;
    }
  } catch (error) {
    console.error('加载会话列表失败', error);
  }
};

// 创建新会话
const createNewSession = async () => {
  try {
    const res = await createSession();
    if (res.data.code === 200) {
      currentSessionId.value = res.data.data.session_id;
      messages.value = [{ role: 'assistant', content: '您好，我是您的 AI 智能助手，有什么可以帮您？' }];
      showHistory.value = false;
      loadSessionList(); // 刷新列表
    }
  } catch (error) {
    showToast('创建会话失败');
  }
};

// 切换会话
const switchSession = async (sessionId: string) => {
  if (currentSessionId.value === sessionId) {
    showHistory.value = false;
    return;
  }

  currentSessionId.value = sessionId;
  showHistory.value = false;
  loading.value = true;

  try {
    const res = await getSessionMessages(sessionId);
    if (res.data.code === 200) {
      // 后端返回的消息格式可能需要适配
      // 假设后端返回的是 JSON 对象的列表，直接使用
      // 如果是字符串列表，需要处理
      messages.value = res.data.data.map((msg: any) => {
        // 兼容后端可能存储的格式差异
        if (typeof msg === 'string') return { role: 'user', content: msg }; // 兜底
        return msg;
      });
      scrollToBottom();
    }
  } catch (error) {
    showToast('加载消息失败');
  } finally {
    loading.value = false;
  }
};

// 发送消息
const handleSend = async () => {
  const content = inputValue.value.trim();
  if (!content) return;

  if (!currentSessionId.value) {
    await createNewSession();
  }

  // 添加用户消息
  messages.value.push({ role: 'user', content });
  inputValue.value = '';
  scrollToBottom();

  loading.value = true;

  // 使用 fetch 处理流式响应
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(chatStreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        question: content,
        session_id: currentSessionId.value
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // 添加助手消息占位
    const assistantMsgIndex = messages.value.length;
    messages.value.push({ role: 'assistant', content: '' });
    loading.value = false; // 开始接收流，取消 loading 状态
    isStreaming.value = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // 处理流式响应数据
      // 检查是否包含 data: 前缀 (简单的 SSE 兼容处理)
      if (chunk.includes('data: ')) {
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6); // 去掉 'data: '
            if (content === '[DONE]') continue;
            messages.value[assistantMsgIndex].content += content;
          } else if (line.trim() && !line.startsWith('data:')) {
            // 可能是普通文本或多行数据的一部分，暂直接追加
            // messages.value[assistantMsgIndex].content += line;
          }
        }
      } else {
        // 纯文本流，直接追加实现打字机效果
        messages.value[assistantMsgIndex].content += chunk;
      }

      scrollToBottom();
    }

    // 刷新会话列表以更新 last_message
    loadSessionList();

  } catch (error) {
    console.error(error);
    showToast('发送失败');
    messages.value.push({ role: 'assistant', content: '发送失败，请重试。' });
  } finally {
    loading.value = false;
    isStreaming.value = false;
  }
};

onMounted(async () => {
  await loadSessionList();
  // 如果没有会话，自动创建一个
  if (sessionList.value.length === 0) {
    await createNewSession();
  } else {
    // 加载最近的一个会话
    const latestSession = sessionList.value[0];
    await switchSession(latestSession.session_id);
  }
});
</script>

<style scoped>
.ai-chat-page {
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
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.avatar {
  margin: 0 8px;
}

.content-wrapper {
  max-width: 70%;
}

.bubble {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-all;
  position: relative;
}

.assistant .bubble {
  background-color: #fff;
  color: #333;
  border-top-left-radius: 0;
}

.user .bubble {
  background-color: #1989fa;
  color: #fff;
  border-top-right-radius: 0;
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 8px 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.input-field {
  background-color: #f7f8fa;
  border-radius: 20px;
  padding: 6px 16px;
}

/* 侧边栏样式 */
.history-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
}

.active-session {
  background-color: #e6f7ff;
}
</style>

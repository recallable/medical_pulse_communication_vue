<template>
  <div class="chat-room">
    <van-nav-bar :title="friendName" left-arrow @click-left="onClickLeft" fixed placeholder />

    <div class="message-list" ref="messageListRef">
      <div v-for="msg in messages" :key="msg.id" class="message-item"
        :class="{ 'mine': msg.sender_id === currentUserId }">
        <div class="message-content">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <div class="input-area">
      <van-field v-model="messageText" center clearable placeholder="请输入消息">
        <template #button>
          <van-button size="small" type="primary" @click="sendMessage">发送</van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getChatHistory } from '@/api/chat'
import type { ChatHistoryItem } from '@/api/chat'
import wsService from '@/api/ws'

const route = useRoute()
const router = useRouter()
const friendId = Number(route.query.id)
const friendName = String(route.query.username || '聊天')

const messages = ref<ChatHistoryItem[]>([])
const messageText = ref('')
const loading = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const currentUserId = ref<number>(0)

const onClickLeft = () => {
  router.back()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const loadHistory = async () => {
  loading.value = true
  try {
    const res = await getChatHistory(friendId)
    if (res.data.code === 200) {
      messages.value = res.data.data
      scrollToBottom()
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleReceiveMessage = (data: any) => {
  // 简单的消息过滤，实际项目中可能需要更严谨的判断
  console.log(data);

  if (data.to === currentUserId.value) {
    messages.value.push(data)
    scrollToBottom()
  }
}

const sendMessage = () => {
  if (!messageText.value.trim()) return

  const content = messageText.value

  const msgPayload = {
    to: friendId,
    content: content,
    type: 'text'
  }

  wsService.send(msgPayload)

  // 乐观更新
  messages.value.push({
    id: Date.now(),
    sender_id: currentUserId.value,
    receiver_id: friendId,
    content: content,
    type: 'text',
    created_at: new Date().toISOString()
  })

  messageText.value = ''
  scrollToBottom()
}

onMounted(async () => {
  // 获取当前用户信息
  const userStr = localStorage.getItem('userInfo')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      currentUserId.value = user.id
    } catch (e) {
      console.error('Failed to parse user info', e)
    }
  }

  // 连接 WebSocket
  // const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws`

  // wsService.connect(wsUrl)
  wsService.onMessage(handleReceiveMessage)

  await loadHistory()
})

onUnmounted(() => {
  wsService.offMessage(handleReceiveMessage)
})
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f8fa;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 60px;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
}

.message-item.mine {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #fff;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-all;
}

.message-item.mine .message-content {
  background-color: #1989fa;
  color: #fff;
}

.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #ebedf0;
  z-index: 99;
}
</style>

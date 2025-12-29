<template>
  <div class="friend-list-page">
    <van-nav-bar title="我的好友" left-text="返回" left-arrow @click-left="onClickLeft" fixed placeholder />

    <van-search v-model="searchText" placeholder="搜索好友" />

    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell v-for="friend in filteredFriends" :key="friend.friend_id" @click="goToChat(friend)" center is-link>
        <template #icon>
          <div class="avatar-wrapper">
            <van-image round width="45" height="45"
              :src="friend.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'" fit="cover" />
            <van-badge v-if="friend.unread_count && friend.unread_count > 0" :content="friend.unread_count" max="99"
              class="unread-badge" />
          </div>
        </template>

        <template #title>
          <div class="friend-title">
            <span class="friend-name">{{ friend.friend_username }}</span>
            <van-tag :type="friend.status === 'online' ? 'success' : 'default'" class="status-tag">
              {{ friend.status === 'online' ? '在线' : '离线' }}
            </van-tag>
          </div>
        </template>

        <template #label>
          <div class="friend-msg text-ellipsis">
            {{ friend.last_message || '暂无消息' }}
          </div>
        </template>
      </van-cell>
    </van-list>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getFriendList } from '@/api/chat'
import type { FriendInfo } from '@/api/chat'

const router = useRouter()
const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const friends = ref<FriendInfo[]>([])

const filteredFriends = computed(() => {
  if (!searchText.value) return friends.value
  return friends.value.filter(f => f.friend_username.includes(searchText.value))
})

const onClickLeft = () => {
  router.back()
}

const onLoad = async () => {
  try {
    const res = await getFriendList()
    if (res.data.code === 200) {
      console.log(res.data.data);

      friends.value = res.data.data || []
    } else {
      showToast(res.data.message || '获取好友列表失败')
    }
  } catch (error) {
    console.error(error)
    showToast('网络错误')
  } finally {
    loading.value = false
    finished.value = true
  }
}

const goToChat = (friend: FriendInfo) => {
  router.push({
    name: 'ChatRoom',
    query: {
      id: friend.friend_id,
      username: friend.friend_username
    }
  })
}

onMounted(() => {
  // Initial load is handled by van-list @load, but we can also call it manually if needed
  // loading.value = true
  // onLoad()
})
</script>
<style scoped>
.friend-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
}

.friend-title {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.friend-name {
  font-weight: 500;
  font-size: 16px;
  margin-right: 8px;
}

.status-tag {
  transform: translateY(1px);
}

.friend-msg {
  color: #969799;
  font-size: 13px;
}

.text-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

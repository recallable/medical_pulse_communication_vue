<template>
  <div class="course-comment">
    <!-- 发布评价区域 -->
    <div class="write-comment-btn" @click="showWriteComment = true">
      <van-button icon="edit" type="primary" block round>写评价</van-button>
    </div>

    <!-- 评价列表 -->
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadComments">
      <div v-if="comments.length === 0 && !loading" class="empty-state">
        <van-empty description="暂无评价，快来抢沙发吧" />
      </div>

      <div v-for="item in comments" :key="item.id" class="comment-item">
        <div class="user-info">
          <van-image round width="32" height="32"
            :src="item.user_avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'" />
          <div class="user-meta">
            <div class="username">{{ item.username }}</div>
            <div class="rating-row">
              <van-rate v-model="item.rating" readonly size="10" color="#ffd21e" void-icon="star" void-color="#eee" />
              <span class="time">{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="comment-content">
          <div class="text" :class="{ 'collapsed': !item.expanded && item.content.length > 100 }">
            {{ item.content }}
          </div>
          <span v-if="item.content.length > 100" class="expand-btn" @click="item.expanded = !item.expanded">
            {{ item.expanded ? '收起' : '全文' }}
          </span>
        </div>

        <div class="tags-row" v-if="item.tags && item.tags.length">
          <van-tag v-for="tag in item.tags" :key="tag" plain type="primary" class="mr-2">{{ tag }}</van-tag>
        </div>
      </div>
    </van-list>

    <!-- 写评价弹窗 -->
    <van-popup v-model:show="showWriteComment" position="bottom" round closeable :style="{ height: '70%' }">
      <div class="write-comment-popup">
        <div class="popup-title">发布评价</div>

        <div class="form-item">
          <div class="label">评分</div>
          <van-rate v-model="commentForm.rating" size="24" color="#ffd21e" void-icon="star" void-color="#eee" />
        </div>

        <div class="form-item">
          <div class="label">标签</div>
          <div class="tags-selector">
            <van-tag v-for="tag in presetTags" :key="tag" size="medium" :plain="!commentForm.tags.includes(tag)"
              type="primary" class="tag-item" @click="toggleTag(tag)">
              {{ tag }}
            </van-tag>
            <div class="custom-tag-input" v-if="showCustomTagInput">
              <van-field v-model="customTag" placeholder="自定义标签" size="small" @blur="addCustomTag"
                @keyup.enter="addCustomTag" />
            </div>
            <van-tag v-else size="medium" plain type="success" class="tag-item" @click="showCustomTagInput = true">+
              自定义</van-tag>
          </div>
        </div>

        <div class="form-item">
          <div class="label">内容</div>
          <van-field v-model="commentForm.content" rows="4" autosize type="textarea" maxlength="300"
            placeholder="课程内容怎么样？快来说说你的看法吧~" show-word-limit class="content-input" />
        </div>

        <div class="submit-btn-wrapper">
          <van-button type="primary" block round :loading="submitting" @click="submitComment" :disabled="!isValid">
            提交评价
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { showToast, showSuccessToast } from 'vant';
import { getCourseCommentList, createCourseComment } from '@/api/knowledge';
import type { CourseCommentItem } from '@/api/knowledge';
import dayjs from 'dayjs';

interface Props {
  courseId: number;
}

const props = defineProps<Props>();

// 列表相关状态
const loading = ref(false);
const finished = ref(false);
const comments = ref<(CourseCommentItem & { expanded?: boolean })[]>([]);
const page = ref(1);
const size = 10;

// 发布评价相关状态
const showWriteComment = ref(false);
const submitting = ref(false);
const showCustomTagInput = ref(false);
const customTag = ref('');
const presetTags = ['干货满满', '通俗易懂', '实战性强', '逻辑清晰', '推荐学习', '内容详实'];

const commentForm = reactive({
  rating: 5,
  tags: [] as string[],
  content: ''
});

// 表单校验
const isValid = computed(() => {
  return commentForm.rating > 0 && commentForm.content.trim().length > 0;
});

// 加载评论列表
const loadComments = async () => {
  try {
    const res = await getCourseCommentList(props.courseId, {
      page: page.value,
      size: size
    });

    if (res.data.code === 200) {
      const { items, total } = res.data.data;
      if (page.value === 1) {
        comments.value = items.map(item => ({ ...item, expanded: false }));
      } else {
        comments.value.push(...items.map(item => ({ ...item, expanded: false })));
      }

      // 判断是否加载完成
      if (comments.value.length >= total) {
        finished.value = true;
      } else {
        page.value++;
      }
    }
  } catch (error) {
    console.error(error);
    finished.value = true; // 出错时停止加载
  } finally {
    loading.value = false;
  }
};

// 切换标签选择
const toggleTag = (tag: string) => {
  const index = commentForm.tags.indexOf(tag);
  if (index > -1) {
    commentForm.tags.splice(index, 1);
  } else {
    commentForm.tags.push(tag);
  }
};

// 添加自定义标签
const addCustomTag = () => {
  if (customTag.value.trim()) {
    if (!commentForm.tags.includes(customTag.value.trim())) {
      commentForm.tags.push(customTag.value.trim());
    }
    customTag.value = '';
  }
  showCustomTagInput.value = false;
};

// 提交评价
const submitComment = async () => {
  if (!isValid.value) return;

  submitting.value = true;
  try {
    const res = await createCourseComment({
      course_id: props.courseId,
      rating: commentForm.rating,
      tags: commentForm.tags,
      content: commentForm.content
    });

    if (res.data.code === 200) {
      showSuccessToast('评价发布成功');
      showWriteComment.value = false;
      // 重置表单
      commentForm.rating = 5;
      commentForm.tags = [];
      commentForm.content = '';
      // 刷新列表
      page.value = 1;
      finished.value = false;
      comments.value = [];
      loading.value = true;
      loadComments();
    } else {
      showToast(res.data.message || '发布失败');
    }
  } catch (error) {
    console.error(error);
    showToast('发布失败，请重试');
  } finally {
    submitting.value = false;
  }
};

// 格式化时间
const formatDate = (dateStr: string) => {
  const date = dayjs(dateStr);
  const now = dayjs();
  const diffDays = now.diff(date, 'day');

  if (diffDays < 1) {
    return '刚刚'; // 或者具体小时前
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.format('YYYY-MM-DD');
  }
};
</script>

<style scoped>
.course-comment {
  padding: 16px;
  background: #fff;
  min-height: 300px;
}

.write-comment-btn {
  margin-bottom: 20px;
}

.comment-item {
  border-bottom: 1px solid #f5f5f5;
  padding: 16px 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-meta {
  margin-left: 10px;
  flex: 1;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-bottom: 12px;
}

.text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.expand-btn {
  color: #1989fa;
  font-size: 14px;
  cursor: pointer;
  margin-top: 4px;
  display: inline-block;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mr-2 {
  margin-right: 0;
  /* Override helper if using gap */
}

/* Write Comment Popup */
.write-comment-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 24px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 4px 12px;
}

.custom-tag-input {
  width: 100px;
}

.content-input {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

.submit-btn-wrapper {
  margin-top: auto;
  padding-bottom: 20px;
}
</style>

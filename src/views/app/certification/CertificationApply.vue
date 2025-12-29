<template>
  <div class="certification-apply-page">
    <van-nav-bar title="申请认证" left-text="返回" left-arrow @click-left="onClickLeft" />

    <div class="content">
      <van-form @submit="onSubmit">
        <!-- 身份证上传区域 -->
        <div class="upload-section">
          <p class="section-title">请上传身份证照片</p>
          <div class="upload-container">
            <div class="upload-item">
              <van-uploader v-model="fileListFront" :max-count="1" :after-read="afterReadFront" upload-text="人像面" />
            </div>
            <div class="upload-item">
              <van-uploader v-model="fileListBack" :max-count="1" :after-read="afterReadBack" upload-text="国徽面" />
            </div>
          </div>
          <p class="upload-tip">拍摄时请确保身份证边框完整、字迹清晰</p>
        </div>

        <!-- 表单区域 -->
        <van-cell-group inset class="form-group">
          <van-field v-model="form.real_name" name="real_name" label="真实姓名" placeholder="上传身份证自动识别"
            :rules="[{ required: true, message: '请输入真实姓名' }]" />
          <van-field v-model="form.id_card" name="id_card" label="身份证号" placeholder="上传身份证自动识别"
            :rules="[{ required: true, message: '请输入身份证号' }]" />
        </van-cell-group>

        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            提交认证
          </van-button>
        </div>
      </van-form>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import 'vant/es/toast/style';
import { uploadOcr, getOcrStatus, submitCertification } from '@/api/user';
import type { CertificationParams, OcrData } from '@/api/user';


const router = useRouter();
const loading = ref(false);

const form = reactive<CertificationParams>({
  real_name: '',
  id_card: '',
  id_card_front: '',
  id_card_back: ''
});

const fileListFront = ref<any[]>([]);
const fileListBack = ref<any[]>([]);

// 临时存储上传结果
const tempFrontTaskId = ref<string>(''); // 存储正面 OCR 任务ID
const tempBackTaskId = ref<string>('');  // 存储反面 OCR 任务ID
const tempBackFileId = ref<string>('');  // 存储反面文件ID (OCR结果中获取)
const tempFrontData = ref<OcrData | null>(null); // 存储正面轮询到的结果

// 分别管理两个轮询定时器
const pollingTimerFront = ref<any>(null);
const pollingTimerBack = ref<any>(null);

const onClickLeft = () => {
  router.back();
};

onUnmounted(() => {
  if (pollingTimerFront.value) clearInterval(pollingTimerFront.value);
  if (pollingTimerBack.value) clearInterval(pollingTimerBack.value);
});

// 尝试填充表单：只有当正反面都上传成功且OCR识别完成后才填充
const tryPopulateForm = () => {
  if (tempFrontData.value && tempBackFileId.value) {
    // 填充正面信息
    if (tempFrontData.value.name) form.real_name = tempFrontData.value.name;
    if (tempFrontData.value.id_card) form.id_card = tempFrontData.value.id_card;
    if (tempFrontData.value.file_id) form.id_card_front = String(tempFrontData.value.file_id);

    // 填充反面信息
    form.id_card_back = tempBackFileId.value;

    showSuccessToast('身份证信息已加载');
  }
};

// 轮询 OCR 状态
const startPolling = (taskId: string, type: 'front' | 'back') => {
  const timerRef = type === 'front' ? pollingTimerFront : pollingTimerBack;

  if (timerRef.value) clearInterval(timerRef.value);

  const poll = async () => {
    try {
      const res = await getOcrStatus(taskId);
      if (res.data.code === 200) {
        const result = res.data.data;
        if (result.status === 'SUCCESS' && result.data) {
          // 成功
          clearInterval(timerRef.value);
          timerRef.value = null;

          // 解析嵌套数据：result.data.data 才是真正的 { name, id_card, file_id }
          if (result.data.code === 200) {
            const data = result.data.data;

            if (type === 'front') {
              tempFrontData.value = data;
              const frontFile = fileListFront.value[0];
              if (frontFile) {
                frontFile.status = 'done';
                frontFile.message = '已识别';
              }
            } else {
              // 反面
              if (data.file_id) {
                tempBackFileId.value = String(data.file_id);
              }
              const backFile = fileListBack.value[0];
              if (backFile) {
                backFile.status = 'done';
                backFile.message = '已识别';
              }
            }

            tryPopulateForm();
          } else {
            // 业务失败
            showFailToast(result.data.message || '识别失败');
            const file = type === 'front' ? fileListFront.value[0] : fileListBack.value[0];
            if (file) {
              file.status = 'failed';
              file.message = '识别失败';
            }
          }
        } else if (result.status === 'FAILURE') {
          // 失败
          clearInterval(timerRef.value);
          timerRef.value = null;
          showFailToast(result.error || '识别任务失败');
          const file = type === 'front' ? fileListFront.value[0] : fileListBack.value[0];
          if (file) {
            file.status = 'failed';
            file.message = '识别失败';
          }
        } else {
          // PENDING
          const file = type === 'front' ? fileListFront.value[0] : fileListBack.value[0];
          if (file) {
            file.message = '识别中...';
          }
        }
      }
    } catch (error) {
      console.error('Polling error', error);
    }
  };

  // 立即执行一次
  poll();
  // 每隔 2 秒轮询一次
  timerRef.value = setInterval(poll, 2000);
};

// 检查是否满足开启轮询的条件（双面都上传完毕）
const checkAndStartPolling = () => {
  if (tempFrontTaskId.value && tempBackTaskId.value) {
    // 开启双路轮询
    startPolling(tempFrontTaskId.value, 'front');
    startPolling(tempBackTaskId.value, 'back');
  }
};

// 上传并识别身份证正面（人像面） -> 获取 Task ID
const afterReadFront = async (fileItem: any) => {
  fileItem.status = 'uploading';
  fileItem.message = '上传中...';

  // 重置相关状态
  tempFrontTaskId.value = '';
  tempFrontData.value = null;
  if (pollingTimerFront.value) clearInterval(pollingTimerFront.value);

  try {
    const res = await uploadOcr(fileItem.file, 'front');
    if (res.data.code === 200) {
      const taskData = res.data.data;
      if (taskData && taskData.task_id) {
        tempFrontTaskId.value = taskData.task_id;
        fileItem.status = 'uploading'; // 保持上传中状态，等待轮询

        if (!tempBackTaskId.value) {
          fileItem.message = '等待背面...';
        } else {
          fileItem.message = '等待识别...';
        }

        // 尝试开启轮询
        checkAndStartPolling();
      } else {
        fileItem.status = 'failed';
        fileItem.message = '任务创建失败';
        showFailToast('OCR任务创建失败');
      }
    } else {
      fileItem.status = 'failed';
      fileItem.message = '上传失败';
      showFailToast(res.data.message || '上传失败');
    }
  } catch (error) {
    fileItem.status = 'failed';
    fileItem.message = '上传失败';
    showFailToast('上传失败');
    console.error(error);
  }
};

// 上传身份证反面（国徽面） -> 获取 Task ID (改为走 OCR 接口)
const afterReadBack = async (fileItem: any) => {
  fileItem.status = 'uploading';
  fileItem.message = '上传中...';

  // 重置相关状态
  tempBackTaskId.value = '';
  tempBackFileId.value = '';
  if (pollingTimerBack.value) clearInterval(pollingTimerBack.value);

  try {
    // 改为使用 uploadOcr
    const res = await uploadOcr(fileItem.file, 'back');
    if (res.data.code === 200) {
      const taskData = res.data.data;
      if (taskData && taskData.task_id) {
        tempBackTaskId.value = taskData.task_id;
        fileItem.status = 'uploading';

        if (!tempFrontTaskId.value) {
          fileItem.message = '等待正面...';
        } else {
          fileItem.message = '等待识别...';
        }

        // 尝试开启轮询
        checkAndStartPolling();
      } else {
        fileItem.status = 'failed';
        fileItem.message = '任务创建失败';
        showFailToast('OCR任务创建失败');
      }
    } else {
      fileItem.status = 'failed';
      fileItem.message = '上传失败';
      showFailToast(res.data.message || '上传失败');
    }
  } catch (error) {
    fileItem.status = 'failed';
    fileItem.message = '上传失败';
    showFailToast('上传失败');
    console.error(error);
  }
};

const onSubmit = async () => {
  if (!form.id_card_front) {
    showFailToast('请上传身份证人像面并等待识别完成');
    return;
  }
  if (!form.id_card_back) {
    showFailToast('请上传身份证国徽面并等待识别完成');
    return;
  }

  loading.value = true;
  try {
    const res = await submitCertification(form);
    if (res.data.code === 200) {
      showSuccessToast('提交成功');
      setTimeout(() => {
        router.replace('/app/mine');
      }, 1500);
    } else {
      showFailToast(res.data.message || '提交失败');
    }
  } catch (error) {
    showFailToast('提交失败，请重试');
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.certification-apply-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding-bottom: 20px;
}

.upload-section {
  background: #fff;
  padding: 20px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #323233;
}

.upload-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.upload-tip {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 10px;
}

.form-group {
  margin-top: 12px;
}
</style>

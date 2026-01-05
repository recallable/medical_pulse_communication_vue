import { ref } from 'vue';
import { 
  getCourseRecommendation, 
  getHotCourses, 
  recordBehavior, 
  viewCourse, 
  favoriteCourse, 
  purchaseCourse,
  type RecommendedCourse,
  type ActionType
} from '@/api/recommendation';

export function useRecommendation() {
  const recommendList = ref<RecommendedCourse[]>([]);
  const loading = ref(false);
  const error = ref(false);

  // 检查是否登录
  const isLogged = () => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  };

  // 加载推荐课程（包含降级逻辑）
  const loadRecommendations = async (limit: number = 4) => {
    loading.value = true;
    error.value = false;
    recommendList.value = [];

    try {
      if (isLogged()) {
        try {
          // 尝试获取个性化推荐
          const res = await getCourseRecommendation(limit, true);
          if (res.data.code === 200 && res.data.data.recommendations.length > 0) {
            recommendList.value = res.data.data.recommendations;
          } else {
            // 无推荐结果，降级为热门
            throw new Error('No recommendations');
          }
        } catch (e) {
          // 推荐接口失败或无数据，降级为热门
          console.warn('推荐获取失败，降级为热门课程', e);
          const hotRes = await getHotCourses(limit);
          if (hotRes.data.code === 200) {
            recommendList.value = hotRes.data.data.courses;
          }
        }
      } else {
        // 未登录，直接获取热门
        const hotRes = await getHotCourses(limit);
        if (hotRes.data.code === 200) {
          recommendList.value = hotRes.data.data.courses;
        }
      }
    } catch (e) {
      console.error('加载推荐/热门课程失败', e);
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  // 刷新推荐（换一批）
  const refreshRecommendations = () => {
    loadRecommendations(4);
  };

  // 行为埋点（静默处理，不阻塞 UI）
  const trackAction = async (courseId: number, type: ActionType, value: any = null) => {
    if (!isLogged()) return; // 未登录不埋点

    try {
      // 优先使用快捷接口
      switch (type) {
        case 'view':
          await viewCourse(courseId);
          break;
        case 'favorite':
          await favoriteCourse(courseId);
          break;
        case 'purchase':
          await purchaseCourse(courseId);
          break;
        default:
          // 通用接口
          await recordBehavior({
            course_id: courseId,
            action_type: type,
            action_value: value
          });
      }
    } catch (e) {
      // 埋点失败仅记录日志，不提示用户
      console.warn(`行为埋点失败 [${type}]`, e);
    }
  };

  return {
    recommendList,
    loading,
    error,
    loadRecommendations,
    refreshRecommendations,
    trackAction
  };
}

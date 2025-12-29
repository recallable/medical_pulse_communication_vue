import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 按需导入 Element Plus，提升启动速度
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// Vant 样式 (如果自动按需引入插件未配置样式，则需要手动引入，这里保留以防万一)
import 'vant/lib/index.css'

import App from '@/App.vue'
import router from '@/router'

/**
 * 初始化 Vue 应用实例
 * 1. 注册所有 Element Plus 图标组件
 * 2. 配置路由和状态管理
 * 3. 挂载应用到 #app 元素
 */
const app = createApp(App)

// 注册所有图标（按需使用）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

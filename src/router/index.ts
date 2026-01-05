import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginPage.vue'),
    },
    {
      path: '/login/account',
      name: 'AccountLogin',
      component: () => import('@/views/login/AccountLogin.vue'),
    }, {
      path: '/login/home',
      name: 'LoginHome',
      component: () => import('@/views/login/Home.vue'),
    },
    {
      path: '/app/ai/chat',
      name: 'AiChat',
      component: () => import('@/views/app/ai/AiChat.vue')
    },
    {
      path: '/app',
      component: () => import('@/views/app/layout/AppLayout.vue'),
      redirect: '/app/mine',
      children: [
        {
          path: 'home',
          name: 'AppHome',
          component: () => import('@/views/app/home/Home.vue'),
        },
        {
          path: 'broadcast',
          name: 'AppBroadcast',
          component: () => import('@/views/app/home/Home.vue'), // 暂时复用Home
        },
        {
          path: 'case',
          name: 'AppCase',
          component: () => import('@/views/app/case/CaseLibrary.vue'),
        },
        {
          path: 'guide',
          name: 'AppGuide',
          component: () => import('@/views/app/home/Home.vue'), // 暂时复用Home
        },
        {
          path: 'studio',
          name: 'AppStudio',
          component: () => import('@/views/app/studio/Studio.vue'),
        },
        {
          path: 'mine',
          name: 'AppMine',
          component: () => import('@/views/app/mine/Mine.vue'),
        },
        {
          path: 'certification/apply',
          name: 'CertificationApply',
          component: () => import('@/views/app/certification/CertificationApply.vue'),
        },
        {
          path: 'certification/detail',
          name: 'CertificationDetail',
          component: () => import('@/views/app/certification/CertificationDetail.vue'),
        },
        {
          path: 'knowledge/bank',
          name: 'KnowledgeBank',
          component: () => import('@/views/app/knowledge/KnowledgeBank.vue')
        },
        {
          path: 'knowledge/list',
          name: 'CourseList',
          component: () => import('@/views/app/knowledge/CourseList.vue')
        },
      ]
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/layout/AdminLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/home/Home.vue'), // 复用现有Home作为临时Dashboard
        }
      ]
    },
    {
      path: '/friend/list',
      name: 'FriendList',
      component: () => import('@/views/app/message/FriendList.vue')
    },
    {
      path: '/chat/room',
      name: 'ChatRoom',
      component: () => import('@/views/app/message/ChatRoom.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ],
})

export default router

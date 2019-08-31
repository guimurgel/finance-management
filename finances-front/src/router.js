import Vue from 'vue'
import Router from 'vue-router'

import authRoutes from '@/modules/auth/router'
import dashboardsRoutes from '@/modules/dashboard/router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    ...authRoutes,
    ...dashboardsRoutes,
    { path: '', redirect: '/login' }
  ]
})

const RecordsHome = () => import('./../views/RecordsHome.vue')

export default [
  {
    paht: 'records',
    component: RecordsHome,
    meta: {
      requiresAuth: true
    },
    alias: ['home', '']
  }
]

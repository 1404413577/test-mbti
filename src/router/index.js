import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import MdTest from '@/components/MdTest.vue'
import TestOverview from '@/views/TestOverview.vue'
import TestIntro from '@/views/TestIntro.vue'
import HistoryResults from '@/views/HistoryResults.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/md-test/:type',
    name: 'MdTest',
    component: MdTest,
    props: true
  },
  {
    path: '/test-overview',
    name: 'TestOverview',
    component: TestOverview
  },
  {
    path: '/test-intro',
    name: 'TestIntro',
    component: TestIntro
  },
  {
    path: '/test-history',
    name: 'HistoryResults',
    component: HistoryResults
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
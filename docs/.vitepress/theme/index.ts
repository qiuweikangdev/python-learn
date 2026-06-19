import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import VPSidebar from './components/VPSidebar.vue'
import './styles/sidebar.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册自定义组件
    app.component('VPSidebar', VPSidebar)
  }
} satisfies Theme

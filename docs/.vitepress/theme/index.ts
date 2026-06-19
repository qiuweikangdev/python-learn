import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './components/Layout.vue'
import './styles/sidebar.css'

export default {
  extends: DefaultTheme,
  Layout
} satisfies Theme

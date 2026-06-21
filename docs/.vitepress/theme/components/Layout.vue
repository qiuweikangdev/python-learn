<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const isCollapsed = ref(false)
const route = useRoute()

// 判断当前页面是否在Agent开发相关的页面
const isAgentRelatedPage = computed(() => {
  const path = route.path
  return path.startsWith('/day101-105/') || 
         path.startsWith('/day106-110/') || 
         path.startsWith('/day111-115/') || 
         path.startsWith('/day116-120/') || 
         path.startsWith('/day121-125/') || 
         path.startsWith('/day126-130/') || 
         path.startsWith('/day131-135/') || 
         path.startsWith('/day136-140/') || 
         path.startsWith('/day141-145/') ||
         path.startsWith('/agent/')
})

// 站点标题链接
const siteTitleLink = computed(() => {
  return isAgentRelatedPage.value ? '/agent/' : '/'
})

function toggle() {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    document.body.classList.add('sidebar-collapsed')
    localStorage.setItem('vp-sidebar-collapsed', '1')
  } else {
    document.body.classList.remove('sidebar-collapsed')
    localStorage.removeItem('vp-sidebar-collapsed')
  }
}

onMounted(() => {
  if (localStorage.getItem('vp-sidebar-collapsed') === '1') {
    isCollapsed.value = true
    document.body.classList.add('sidebar-collapsed')
  }
  
  // 修改站点标题链接
  updateSiteTitleLink()
})

// 监听路由变化，更新站点标题链接
watch(() => route.path, () => {
  updateSiteTitleLink()
})

function updateSiteTitleLink() {
  // 等待DOM更新
  setTimeout(() => {
    const titleLink = document.querySelector('.VPNavBarTitle .title')
    if (titleLink) {
      titleLink.setAttribute('href', siteTitleLink.value)
    }
  }, 100)
}
</script>

<template>
  <Layout>
    <template #sidebar-nav-after>
      <button
        class="sidebar-collapse-btn"
        @click="toggle"
        :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
        :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <svg
          class="sidebar-collapse-icon"
          :class="{ collapsed: isCollapsed }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </template>
  </Layout>

  <!-- 侧边栏折叠时显示的展开按钮 -->
  <Teleport to="body">
    <Transition name="fade">
      <button
        v-show="isCollapsed"
        class="sidebar-expand-btn"
        @click="toggle"
        aria-label="展开侧边栏"
        title="展开侧边栏"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebar-collapse-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.sidebar-collapse-btn:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.sidebar-collapse-icon {
  transition: transform 0.3s ease;
}

.sidebar-collapse-icon.collapsed {
  transform: rotate(180deg);
}
</style>

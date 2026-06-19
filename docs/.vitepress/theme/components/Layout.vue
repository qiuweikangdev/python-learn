<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted, ref } from 'vue'

const { Layout } = DefaultTheme
const isCollapsed = ref(false)

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
})
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

<script lang="ts" setup>
import { useScrollLock } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { ref, watch } from 'vue'
import { useSidebar } from 'vitepress/dist/client/theme-default/composables/sidebar'
import VPSidebarGroup from 'vitepress/dist/client/theme-default/components/VPSidebarGroup.vue'

const { sidebarGroups, hasSidebar } = useSidebar()

const props = defineProps<{
  open: boolean
}>()

const navEl = ref<HTMLElement | null>(null)
const isLocked = useScrollLock(inBrowser ? document.body : null)

watch(
  [props, navEl],
  () => {
    if (props.open) {
      isLocked.value = true
      navEl.value?.focus()
    } else isLocked.value = false
  },
  { immediate: true, flush: 'post' }
)

const key = ref(0)

watch(
  sidebarGroups,
  () => {
    key.value += 1
  },
  { deep: true }
)

// 折叠状态管理
const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside
    v-if="hasSidebar"
    class="VPSidebar"
    :class="{ open, collapsed: isCollapsed }"
    ref="navEl"
    @click.stop
  >
    <div class="curtain" />

    <nav
      class="nav"
      id="VPSidebarNav"
      aria-labelledby="sidebar-aria-label"
      tabindex="-1"
    >
      <span class="visually-hidden" id="sidebar-aria-label">
        Sidebar Navigation
      </span>

      <slot name="sidebar-nav-before" />
      <VPSidebarGroup :items="sidebarGroups" :key="key" />
      <slot name="sidebar-nav-after" />
    </nav>

    <!-- 折叠/展开按钮 -->
    <button
      class="sidebar-collapse-button"
      @click="toggleSidebar"
      :aria-label="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
    >
      <svg
        class="collapse-icon"
        :class="{ rotated: isCollapsed }"
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
  </aside>
</template>

<style scoped>
.VPSidebar {
  position: fixed;
  top: var(--vp-layout-top-height, 0px);
  bottom: 0;
  left: 0;
  z-index: var(--vp-z-index-sidebar);
  padding: 32px 32px 96px;
  width: calc(100vw - 64px);
  max-width: 320px;
  background-color: var(--vp-sidebar-bg-color);
  opacity: 0;
  box-shadow: var(--vp-c-shadow-3);
  overflow-x: hidden;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: opacity 0.5s, transform 0.25s ease;
  overscroll-behavior: contain;
}

.VPSidebar.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  transition: opacity 0.25s,
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.VPSidebar.collapsed {
  transform: translateX(-100%);
  opacity: 0;
  visibility: hidden;
}

.dark .VPSidebar {
  box-shadow: var(--vp-shadow-1);
}

@media (min-width: 960px) {
  .VPSidebar {
    padding-top: var(--vp-nav-height);
    width: var(--vp-sidebar-width);
    max-width: 100%;
    background-color: var(--vp-sidebar-bg-color);
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    transform: translateX(0);
  }
  
  .VPSidebar.collapsed {
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
  }
}

@media (min-width: 1440px) {
  .VPSidebar {
    padding-left: max(32px, calc((100% - (var(--vp-layout-max-width) - 64px)) / 2));
    width: calc((100% - (var(--vp-layout-max-width) - 64px)) / 2 + var(--vp-sidebar-width) - 32px);
  }
}

@media (min-width: 960px) {
  .curtain {
    position: sticky;
    top: -64px;
    left: 0;
    z-index: 1;
    margin-top: calc(var(--vp-nav-height) * -1);
    margin-right: -32px;
    margin-left: -32px;
    height: var(--vp-nav-height);
    background-color: var(--vp-sidebar-bg-color);
  }
}

.nav {
  outline: 0;
}

/* 折叠按钮样式 */
.sidebar-collapse-button {
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
}

.sidebar-collapse-button:hover {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.collapse-icon {
  transition: transform 0.3s ease;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}
</style>

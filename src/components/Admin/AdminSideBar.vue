<template>
  <aside
    class="w-[290px] min-h-screen bg-black rounded-r-[28px] px-5 py-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,255,255,0.08)]"
  >
    <div>
      <div class="relative mb-8">
        <div class="flex justify-center">
          <div class="w-[185px] h-[60px] overflow-hidden flex items-center justify-center">
            <img
              :src="logo"
              alt="Stag.io Logo"
              class="w-[220px] max-w-none object-contain -mt-2"
            />
          </div>
        </div>
        <span class="absolute top-1 right-3 text-[11px] text-gray-400">v.01</span>
      </div>

      <nav class="space-y-3">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200"
          :class="
            route.path === item.to
              ? 'bg-[#1E4ED8] text-white'
              : 'text-[#BFC7D5] hover:bg-[#111827] hover:text-white'
          "
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" :size="18" />
            <span class="text-[18px] font-medium">{{ item.label }}</span>
          </div>

          <ChevronRight :size="16" />
        </RouterLink>
      </nav>

      <div class="mt-8 px-4">
        <button
          type="button"
          @click="handleLogout"
          class="text-[#BFC7D5] hover:text-white text-[18px] font-medium transition"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between px-3 pt-6">
      <div class="flex items-center gap-3 min-w-0">
        <img
          :src="adminPhoto"
          alt="Admin profile"
          class="w-11 h-11 rounded-full object-cover"
        />
        <div class="min-w-0">
          <h4 class="text-white text-[18px] font-medium leading-none truncate">
            {{ adminName }}
          </h4>
          <p class="text-[#6B7280] text-[14px] mt-1 truncate">{{ adminRoleLabel }}</p>
        </div>
      </div>

      <ChevronDown :size="18" class="text-[#9CA3AF] shrink-0" />
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Building2,
  BadgeCheck,
  FileText,
  ChevronRight,
  ChevronDown,
} from 'lucide-vue-next'
import { logoutUser, clearAdminAuthStorage } from '@/services/auth'
import logo from '@/assets/Images/logo.png'

const route = useRoute()
const router = useRouter()

const adminName = ref('Admin')
const adminRoleLabel = ref('Platform Administrator')
const adminPhoto = ref(getDefaultAvatar('Admin'))

const menuItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Account Approvals',
    to: '/admin/company-approvals',
    icon: Building2,
  },
  {
    label: 'Internship Validations',
    to: '/admin/internship-validations',
    icon: BadgeCheck,
  },
  {
    label: 'Agreements',
    to: '/admin/agreements',
    icon: FileText,
  },
]

function getStoredAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('admin_user')) || {}
  } catch {
    return {}
  }
}

function getDefaultAvatar(name = 'Admin') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=111827&color=fff`
}

function loadAdminData() {
  const user = getStoredAdminUser()
  const displayName = user?.name || 'Admin'

  adminName.value = displayName
  adminRoleLabel.value = 'Platform Administrator'
  adminPhoto.value = user?.profile_photo || getDefaultAvatar(displayName)
}

const handleLogout = async () => {
  try {
    await logoutUser(true)
  } catch (error) {
    console.error('Logout error:', error.response?.data || error)
  } finally {
    clearAdminAuthStorage()
    await router.replace('/admin')
  }
}

onMounted(() => {
  loadAdminData()
  window.addEventListener('admin-profile-updated', loadAdminData)
})

onBeforeUnmount(() => {
  window.removeEventListener('admin-profile-updated', loadAdminData)
})

watch(
  () => route.fullPath,
  () => {
    loadAdminData()
  }
)
</script>
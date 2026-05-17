<template>
  <aside
    class="w-[290px] min-h-screen bg-black rounded-r-[28px] px-5 py-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,255,255,0.08)]"
  >
    <div>
      <!-- LOGO -->
      <div class="relative mb-10">
        <div class="flex justify-center">
          <div class="w-[185px] h-[60px] overflow-hidden flex items-center justify-center">
            <img
              :src="logo"
              alt="Stag.io Logo"
              class="w-[220px] max-w-none object-contain -mt-2"
            />
          </div>
        </div>
      </div>

      <!-- NAVIGATION -->
      <nav class="space-y-3">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200"
          :class="
            isActive(item.to)
              ? 'bg-[#1846D0] text-white'
              : 'text-[#d1d5db] hover:bg-[#111827] hover:text-white'
          "
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </div>

          <ChevronRight v-if="!isActive(item.to)" class="w-4 h-4 opacity-70" />
        </RouterLink>
      </nav>

      <!-- LOGOUT -->
      <button
        type="button"
        @click="handleLogout"
        class="mt-10 px-4 py-3 text-left text-[#b7bfd8] hover:text-red-500 transition text-[15px] font-medium cursor-pointer"
      >
        Logout
      </button>
    </div>

    <!-- USER CARD -->
    <div class="flex items-center justify-between px-3 py-3 rounded-2xl bg-[#0f0f10]">
      <div class="flex items-center gap-3 min-w-0">
        <img
          :src="companyPhoto"
          alt="company user"
          class="w-11 h-11 rounded-full object-cover"
        />

        <div class="min-w-0">
          <p class="text-white text-sm font-medium leading-none truncate">
            {{ companyName }}
          </p>

          <p class="text-gray-400 text-xs mt-1 truncate">
            {{ companyIndustry }}
          </p>
        </div>
      </div>

      <ChevronDown class="w-4 h-4 text-gray-400 shrink-0" />
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  ChevronRight,
  ChevronDown,
} from 'lucide-vue-next'

import logo from '@/assets/Images/logo.png'
import defaultAvatar from '@/assets/Images/imene.avif'
import { logoutUser, clearAuthStorage } from '@/services/auth'

const route = useRoute()
const router = useRouter()

const companyName = ref('Company')
const companyIndustry = ref('Company')
const companyPhoto = ref(defaultAvatar)

const menuItems = [
  {
    label: 'Dashboard',
    to: '/company/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Company Profile',
    to: '/company/profile',
    icon: Building2,
  },
  {
    label: 'Manage Offers',
    to: '/company/offers',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Candidates',
    to: '/company/candidates',
    icon: Users,
  },
]

const isActive = (path) => route.path === path

const safeJsonParse = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const getStoredUser = () => {
  return safeJsonParse(localStorage.getItem('user'), {})
}

const getCurrentUserId = () => {
  const user = getStoredUser()
  return user?.id || user?.user?.id || null
}

const getStorageKeys = () => {
  const userId = getCurrentUserId()

  return {
    profileKey: userId ? `company_profile_local_${userId}` : null,
    avatarKey: userId ? `company_profile_avatar_local_${userId}` : null,
  }
}

const pickCompanyName = (user, profile) => {
  return (
    profile?.company_name ||
    profile?.companyName ||
    profile?.name ||
    user?.company_profile?.company_name ||
    user?.company_profile?.companyName ||
    user?.company_profile?.name ||
    user?.company_name ||
    user?.companyName ||
    user?.name ||
    'Company'
  )
}

const pickCompanyIndustry = (user, profile) => {
  return (
    profile?.industry ||
    profile?.sector ||
    profile?.activity_sector ||
    user?.company_profile?.industry ||
    user?.company_profile?.sector ||
    user?.company_profile?.activity_sector ||
    user?.industry ||
    'Company'
  )
}

const pickCompanyPhoto = (profile, avatarKey) => {
  const localAvatar = avatarKey ? localStorage.getItem(avatarKey) : null

  return (
    localAvatar ||
    profile?.logo ||
    profile?.logo_url ||
    profile?.avatar ||
    profile?.image ||
    defaultAvatar
  )
}

const loadCompanyData = () => {
  const user = getStoredUser()
  const { profileKey, avatarKey } = getStorageKeys()

  let profile = {}

  if (profileKey) {
    profile = safeJsonParse(localStorage.getItem(profileKey), {})
  }

  companyName.value = pickCompanyName(user, profile)
  companyIndustry.value = pickCompanyIndustry(user, profile)
  companyPhoto.value = pickCompanyPhoto(profile, avatarKey)
}

const handleCompanyProfileUpdated = () => {
  loadCompanyData()
}

const handleStorageChange = (event) => {
  if (
    event.key === 'user' ||
    event.key?.startsWith('company_profile_local_') ||
    event.key?.startsWith('company_profile_avatar_local_')
  ) {
    loadCompanyData()
  }
}

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (error) {
    console.error('Logout error:', error.response?.data || error)
  } finally {
    clearAuthStorage()
    await router.replace('/login')
  }
}

onMounted(() => {
  loadCompanyData()
  window.addEventListener('company-profile-updated', handleCompanyProfileUpdated)
  window.addEventListener('storage', handleStorageChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('company-profile-updated', handleCompanyProfileUpdated)
  window.removeEventListener('storage', handleStorageChange)
})

watch(
  () => route.fullPath,
  () => {
    loadCompanyData()
  }
)
</script>
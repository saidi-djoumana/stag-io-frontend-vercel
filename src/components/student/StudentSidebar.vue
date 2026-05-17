<template>
  <!-- Mobile overlay -->
  <transition name="fade">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 bg-black/60 z-40 md:hidden"
      @click="emit('close')"
    />
  </transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-50 h-screen w-[290px] bg-black rounded-r-[28px] px-5 py-6 flex flex-col justify-between shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-transform duration-300"
    :class="[props.isOpen ? 'translate-x-0' : '-translate-x-full', 'md:translate-x-0']"
  >
    <div>
      <!-- HEADER -->
      <div class="relative mb-6">
        <button
          type="button"
          class="absolute top-0 right-0 md:hidden text-gray-400 hover:text-white transition"
          @click="emit('close')"
        >
          ✕
        </button>

        <div class="flex justify-center">
          <div class="w-[185px] h-[60px] overflow-hidden flex items-center justify-center">
            <img
              :src="logo"
              alt="Stag.io Logo"
              class="w-[220px] max-w-none object-contain -mt-2"
            />
          </div>
        </div>

        <span class="absolute top-1 right-8 text-xs text-gray-400 md:right-3">
          v.01
        </span>
      </div>

      <!-- NAVIGATION -->
      <nav class="space-y-3">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center justify-between rounded-2xl px-4 py-4 text-[15px] transition-all duration-200"
          :class="
            route.path === item.to
              ? 'bg-[#1846D0] text-white shadow-[0_10px_30px_rgba(24,70,208,0.35)]'
              : 'text-[#b7bfd8] hover:bg-[#111827] hover:text-white'
          "
          @click="handleLinkClick"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="h-5 w-5" />
            <span class="font-medium">{{ item.label }}</span>
          </div>

          <ChevronRight v-if="!item.noArrow" class="h-4 w-4" />
        </RouterLink>
      </nav>

      <!-- LOGOUT -->
      <button
        type="button"
        @click="handleLogout"
        class="mt-10 cursor-pointer px-4 py-3 text-left text-[15px] font-medium text-[#b7bfd8] transition hover:text-red-500"
      >
        Logout
      </button>
    </div>

    <!-- USER PROFILE -->
    <div class="flex items-center justify-between rounded-2xl bg-[#0f0f10] p-3">
      <div class="flex items-center gap-3 min-w-0">
        <img
          :src="studentPhoto"
          alt="student"
          class="h-11 w-11 rounded-full object-cover"
        />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-white truncate">{{ studentName }}</p>
          <p class="text-xs text-gray-400">Student</p>
        </div>
      </div>

      <ChevronDown class="h-4 w-4 text-gray-400 shrink-0" />
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-vue-next'
import { logoutUser, clearAuthStorage } from '@/services/auth'
import logo from '@/assets/Images/logo.png'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const studentName = ref('Student')
const studentPhoto = ref('https://ui-avatars.com/api/?name=Student&background=1846D0&color=fff')

const menuItems = [
  {
    label: 'Dashboard',
    to: '/student/dashboard',
    icon: LayoutDashboard,
    noArrow: true,
  },
  {
    label: 'My Digital CV',
    to: '/student/digital-cv',
    icon: FileText,
    noArrow: false,
  },
  {
    label: 'Accepted Internships',
    to: '/student/accepted-internships',
    icon: CheckCircle,
    noArrow: false,
  },
]

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch {
    return {}
  }
}

const getCurrentUserId = () => {
  const user = getStoredUser()
  return user?.id || null
}

const getStorageKeys = () => {
  const userId = getCurrentUserId()

  if (!userId) {
    return {
      userId: null,
      cvKey: null,
      imageKey: null,
    }
  }

  return {
    userId,
    cvKey: `digital_cv_data_${userId}`,
    imageKey: `digital_cv_profile_image_${userId}`,
  }
}

const getDefaultAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=1846D0&color=fff`
}

const loadStudentData = () => {
  const storedUser = getStoredUser()
  const { cvKey, imageKey } = getStorageKeys()

  let fullName =
    storedUser?.student_profile?.full_name ||
    storedUser?.name ||
    'Student'

  let profileImage = ''

  if (cvKey) {
    try {
      const storedCvData = localStorage.getItem(cvKey)

      if (storedCvData) {
        const cvData = JSON.parse(storedCvData)
        fullName = cvData.full_name || fullName
      }
    } catch (error) {
      console.error('Failed to parse student CV data:', error)
    }
  }

  if (imageKey) {
    profileImage = localStorage.getItem(imageKey) || ''
  }

  studentName.value = fullName
  studentPhoto.value = profileImage || getDefaultAvatar(fullName)
}

const handleProfileUpdated = () => {
  loadStudentData()
}

const handleLogout = async () => {
  try {
    await logoutUser()
  } catch (error) {
    console.error('Logout error:', error.response?.data || error)
  } finally {
    clearAuthStorage()
    emit('close')
    await router.replace('/login')
  }
}

const handleLinkClick = () => {
  if (window.innerWidth < 768) {
    emit('close')
  }
}

onMounted(() => {
  loadStudentData()
  window.addEventListener('student-profile-updated', handleProfileUpdated)
})

onBeforeUnmount(() => {
  window.removeEventListener('student-profile-updated', handleProfileUpdated)
})

watch(
  () => route.fullPath,
  () => {
    loadStudentData()
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
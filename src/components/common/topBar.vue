<template>
  <div
    class="w-full bg-[#1b1b1f] rounded-2xl px-4 md:px-6 py-4 flex items-center justify-between gap-4 relative"
  >
    <div class="w-full max-w-full md:max-w-[360px]">
      <input
        :value="searchQuery"
        @input="handleSearchInput"
        type="text"
        :placeholder="searchPlaceholder"
        class="w-full rounded-xl bg-[#f3f4f6] text-black px-4 py-3 outline-none placeholder:text-gray-400"
      />
    </div>

    <div class="flex items-center gap-4">
      <!-- Notification Bell -->
      <div class="relative" data-notification-root>
        <button
          @click="toggleNotifications"
          class="relative"
          type="button"
        >
          <Bell class="w-5 h-5 text-gray-300" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold"
          >
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="showNotifications"
          class="absolute right-0 mt-3 w-[340px] max-h-[420px] overflow-hidden rounded-2xl border border-[#2d2d2d] bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-50"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <h3 class="text-white text-sm font-semibold">Notifications</h3>

            <button
              v-if="notifications.length && unreadCount > 0"
              @click="handleMarkAllAsRead"
              class="text-xs text-[#7ea6ff] hover:text-white transition"
              type="button"
            >
              Mark all as read
            </button>
          </div>

          <div v-if="loadingNotifications" class="px-4 py-6 text-sm text-gray-400 text-center">
            Loading notifications...
          </div>

          <div
            v-else-if="!notifications.length"
            class="px-4 py-6 text-sm text-gray-400 text-center"
          >
            No notifications yet.
          </div>

          <div v-else class="max-h-[340px] overflow-y-auto">
            <button
              v-for="notification in notifications"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              type="button"
              class="w-full text-left px-4 py-3 border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition"
            >
              <div class="flex items-start gap-3">
                <div
                  class="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :class="notification.read_at ? 'bg-gray-600' : 'bg-[#1846D0]'"
                ></div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white leading-5">
                    {{ getNotificationTitle(notification) }}
                  </p>

                  <p
                    v-if="getNotificationMessage(notification)"
                    class="text-xs text-gray-400 mt-1 leading-5"
                  >
                    {{ getNotificationMessage(notification) }}
                  </p>

                  <p class="text-[11px] text-gray-500 mt-2">
                    {{ formatNotificationDate(notification.created_at) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <img
        :src="profileImage"
        alt="profile"
        class="w-10 h-10 rounded-full object-cover border-2 border-[#1846D0]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import defaultCompanyAvatar from '@/assets/Images/imene.avif'
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notifications'

const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
})

const emit = defineEmits(['update:searchQuery'])

const route = useRoute()

const profileImage = ref(getDefaultAvatar('User'))

const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = ref(0)
const loadingNotifications = ref(false)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

function handleSearchInput(event) {
  emit('update:searchQuery', event.target.value)
}

function getCurrentStorage() {
  if (isAdminRoute.value) {
    return {
      userKey: 'admin_user',
      roleKey: 'admin_role',
      tokenKey: 'admin_token',
      authScope: 'admin',
    }
  }

  return {
    userKey: 'user',
    roleKey: 'role',
    tokenKey: 'token',
    authScope: 'main',
  }
}

function getStoredUser() {
  try {
    const { userKey } = getCurrentStorage()
    return JSON.parse(localStorage.getItem(userKey)) || {}
  } catch {
    return {}
  }
}

function getStoredRole() {
  const { roleKey } = getCurrentStorage()
  return localStorage.getItem(roleKey) || ''
}

function getStoredToken() {
  const { tokenKey } = getCurrentStorage()
  return localStorage.getItem(tokenKey) || ''
}

function getCurrentAuthScope() {
  const { authScope } = getCurrentStorage()
  return authScope
}

function getCurrentUserId() {
  const user = getStoredUser()
  return user?.id || null
}

function getDefaultAvatar(name = 'User') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=1846D0&color=fff`
}

function getStudentImage(userId) {
  if (!userId) return ''
  return localStorage.getItem(`digital_cv_profile_image_${userId}`) || ''
}

function getCompanyImage(userId) {
  if (!userId) return ''
  return localStorage.getItem(`company_profile_avatar_local_${userId}`) || ''
}

function loadTopbarProfile() {
  const user = getStoredUser()
  const userId = getCurrentUserId()
  const role = user?.role || getStoredRole()

  if (role === 'student') {
    const studentName =
      user?.student_profile?.full_name ||
      user?.studentProfile?.full_name ||
      user?.name ||
      'Student'

    const studentImage = getStudentImage(userId)

    profileImage.value = studentImage || getDefaultAvatar(studentName)
    return
  }

  if (role === 'company') {
    const companyName =
      user?.company_profile?.company_name ||
      user?.companyProfile?.company_name ||
      user?.name ||
      'Company'

    const companyImage = getCompanyImage(userId)

    profileImage.value =
      companyImage || defaultCompanyAvatar || getDefaultAvatar(companyName)
    return
  }

  if (role === 'admin') {
    const adminName = user?.name || 'Admin'
    profileImage.value = user?.profile_photo || getDefaultAvatar(adminName)
    return
  }

  profileImage.value = getDefaultAvatar(user?.name || 'User')
}

function handleProfileUpdated() {
  loadTopbarProfile()
}

async function fetchUnreadCount() {
  const token = getStoredToken()
  if (!token) return

  try {
    const data = await getUnreadNotificationsCount(getCurrentAuthScope())
    unreadCount.value = data?.unread_count || 0
  } catch (error) {
    console.error('Failed to load unread notifications count:', error)
  }
}

async function fetchNotifications() {
  const token = getStoredToken()
  if (!token) return

  loadingNotifications.value = true

  try {
    const data = await getNotifications(getCurrentAuthScope(), 1)
    notifications.value = data?.data || []
  } catch (error) {
    console.error('Failed to load notifications:', error)
    notifications.value = []
  } finally {
    loadingNotifications.value = false
  }
}

async function toggleNotifications() {
  showNotifications.value = !showNotifications.value

  if (showNotifications.value) {
    await fetchNotifications()
    await fetchUnreadCount()
  }
}

function getNotificationTitle(notification) {
  const data = notification?.data || {}
  const type = notification?.type || ''

  if (data.title) return data.title

  if (type.includes('CompanyRegistrationPendingApprovalNotification')) {
    return 'New company registration pending approval'
  }

  if (type.includes('CompanyApprovedNotification')) {
    return 'Your company account has been approved'
  }

  if (type.includes('CompanyRejectedNotification')) {
    return 'Your company account was rejected or set inactive'
  }

  if (type.includes('AdminValidatedApplicationNotification')) {
    return 'Application validated'
  }

  if (type.includes('AdminRejectedApplicationNotification')) {
    return 'Application rejected'
  }

  if (type.includes('CompanyAcceptedApplicationNotification')) {
    return 'Application accepted by company'
  }

  if (type.includes('CompanyRefusedApplicationNotification')) {
    return 'Application refused by company'
  }

  return 'New notification'
}

function getNotificationMessage(notification) {
  const data = notification?.data || {}

  if (data.message) return data.message
  if (data.body) return data.body
  if (data.company_name) return data.company_name
  if (data.name) return data.name

  return ''
}

function formatNotificationDate(dateString) {
  if (!dateString) return ''

  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return ''
  }
}

async function handleNotificationClick(notification) {
  try {
    if (!notification.read_at) {
      await markNotificationAsRead(notification.id, getCurrentAuthScope())

      notifications.value = notifications.value.map((item) =>
        item.id === notification.id
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )

      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

async function handleMarkAllAsRead() {
  try {
    await markAllNotificationsAsRead(getCurrentAuthScope())

    notifications.value = notifications.value.map((item) => ({
      ...item,
      read_at: item.read_at || new Date().toISOString(),
    }))

    unreadCount.value = 0
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

function handleClickOutside(event) {
  const dropdown = document.querySelector('[data-notification-root]')
  if (!dropdown) return

  if (!dropdown.contains(event.target)) {
    showNotifications.value = false
  }
}

let notificationInterval = null

onMounted(async () => {
  loadTopbarProfile()
  await fetchUnreadCount()

  window.addEventListener('student-profile-updated', handleProfileUpdated)
  window.addEventListener('company-profile-updated', handleProfileUpdated)
  window.addEventListener('admin-profile-updated', handleProfileUpdated)

  document.addEventListener('click', handleClickOutside)

  notificationInterval = setInterval(() => {
    fetchUnreadCount()
  }, 15000)
})

onBeforeUnmount(() => {
  window.removeEventListener('student-profile-updated', handleProfileUpdated)
  window.removeEventListener('company-profile-updated', handleProfileUpdated)
  window.removeEventListener('admin-profile-updated', handleProfileUpdated)

  document.removeEventListener('click', handleClickOutside)

  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})

watch(
  () => route.fullPath,
  async () => {
    loadTopbarProfile()
    showNotifications.value = false
    await fetchUnreadCount()
  }
)
</script>
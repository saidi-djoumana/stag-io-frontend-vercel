<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMe, clearAuthStorage } from '@/services/auth'

const router = useRouter()

onMounted(async () => {
  const token = localStorage.getItem('token')

  if (!token) return

  try {
    const data = await getMe()

    const user = data.user || data
    const role = user.role

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('role', role)

    console.log('User restored from /api/me:', user)
  } catch (error) {
    console.error('Session invalid:', error.response?.data || error)

    // logout + redirect
    clearAuthStorage()
    router.replace('/login')
  }
})
</script>

<template>
  <router-view />
</template>
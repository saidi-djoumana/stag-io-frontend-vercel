<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import AuthInput from '@/components/Auth/AuthInput.vue'
import {
  loginUser,
  clearAuthStorage,
  clearAdminAuthStorage,
} from '@/services/auth'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const isAdminLogin = computed(() => route.path === '/admin')

const pageTitle = computed(() =>
  isAdminLogin.value ? 'Admin Login' : 'Login into your account'
)

const handleLogin = async () => {
  errorMessage.value = ''

  const payload = {
    email: email.value.trim(),
    password: password.value,
  }

  if (!payload.email || !payload.password) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  loading.value = true

  try {
    if (isAdminLogin.value) {
      clearAdminAuthStorage()
    } else {
      clearAuthStorage()
    }

    const data = await loginUser(payload)

    const token = data.token
    const user = data.user || null
    const role = data.role || data.user?.role || null

    if (!token || !user || !role) {
      throw new Error('Invalid authentication response.')
    }

    if (isAdminLogin.value && role !== 'admin') {
      errorMessage.value = 'This login is only for administrators.'
      clearAdminAuthStorage()
      return
    }

    if (!isAdminLogin.value && role === 'admin') {
      errorMessage.value = 'Administrators must log in from the admin page.'
      clearAuthStorage()
      return
    }

    if (isAdminLogin.value) {
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      localStorage.setItem('admin_role', role)
      router.push('/admin/dashboard')
      return
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('role', role)

    if (role === 'student') {
      router.push('/student/dashboard')
    } else if (role === 'company') {
      router.push('/company/dashboard')
    } else {
      router.push('/login')
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error)

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      errorMessage.value = Object.values(errors).flat().join(' ')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Login failed. Please check your credentials.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-[#F5F5F5]">
    <div class="grid h-full w-full grid-cols-1 bg-[#F5F5F5] lg:grid-cols-[1.75fr_0.95fr]">
      <div class="relative hidden h-full overflow-hidden lg:flex lg:items-center lg:justify-center">
        <img
          src="@/assets/Images/Vector2.png"
          class="absolute left-0 top-0 w-[230px]"
        />
        <img
          src="@/assets/Images/Vector3.png"
          class="absolute bottom-0 right-[70px] w-[280px]"
        />
        <img
          src="@/assets/Images/photo2.png"
          class="relative z-10 w-[45%] max-w-[480px]"
        />
      </div>

      <div class="flex h-full items-center justify-center bg-white px-8 py-8 md:px-12">
        <div class="w-full max-w-[450px]">
          <div class="mb-16 flex flex-col items-center">
            <img
              src="@/assets/Images/logo.png"
              class="w-[150px]"
            />

            <h1 class="mt-4 text-center text-[18px] font-semibold text-[#4A4A4A]">
              {{ pageTitle }}
            </h1>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-7">
            <AuthInput
              v-model="email"
              label="Email :"
              type="email"
              placeholder="Enter your Email"
              icon="mail"
            />

            <div>
              <AuthInput
                v-model="password"
                label="Password :"
                type="password"
                placeholder="Enter your password"
                icon="lock"
              />

              <div class="mt-4 flex justify-end">
                <RouterLink
                  to="/forgot-password"
                  class="text-[14px] font-medium text-[#2A3B8F] underline"
                >
                  Forgot password?
                </RouterLink>
              </div>
            </div>

            <p v-if="errorMessage" class="text-sm font-medium text-red-500">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              :disabled="loading"
              class="mt-2 h-[54px] w-full rounded-[10px] bg-[#1846D0] text-[17px] font-semibold text-white shadow-[0_10px_18px_rgba(24,70,208,0.25)] transition hover:opacity-95 disabled:opacity-70"
            >
              {{ loading ? 'Logging in...' : 'Login now' }}
            </button>
          </form>

          <div class="my-10 flex items-center gap-4">
            <div class="h-px flex-1 bg-[#D9D9D9]"></div>
            <span class="text-[18px] text-[#B0B0B0]">OR</span>
            <div class="h-px flex-1 bg-[#D9D9D9]"></div>
          </div>

          <RouterLink
            to="/register"
            class="flex h-[54px] w-full items-center justify-center rounded-[10px] border border-[#2A3B8F] bg-white text-[17px] font-semibold text-[#1E2F86]"
          >
            Signup now
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
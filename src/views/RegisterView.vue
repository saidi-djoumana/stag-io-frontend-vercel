<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthInput from '@/components/Auth/AuthInput.vue'
import AuthSelect from '@/components/Auth/AuthSelect.vue'
import { registerUser, clearAuthStorage } from '@/services/auth'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const role = ref('student')

const roles = ['student', 'company']

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const resetForm = () => {
  name.value = ''
  email.value = ''
  password.value = ''
  password_confirmation.value = ''
  role.value = 'student'
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !name.value ||
    !email.value ||
    !password.value ||
    !password_confirmation.value ||
    !role.value
  ) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  if (password.value !== password_confirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    const data = await registerUser({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: password_confirmation.value,
      role: role.value,
    })

    // IMPORTANT:
    // Even if backend returns token/user/role, we do NOT save them.
    // Registration should NOT log the user in automatically.
        clearAuthStorage()

    successMessage.value =
      data.message ||
      `Registration successful. Your ${role.value} account is pending admin approval. Please wait for approval, then log in.`

    resetForm()

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Register error:', error.response?.data || error)

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      errorMessage.value = Object.values(errors).flat().join(' ')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Registration failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen overflow-hidden bg-[#F5F5F5]">
    <div class="grid h-full w-full lg:grid-cols-[1.33fr_1fr]">
      <!-- Left side -->
      <div class="flex h-full flex-col justify-between px-8 py-6 md:px-10 lg:px-12 xl:px-14">
        <!-- Header -->
        <div class="mt-1 flex flex-col items-center">
          <img
            src="@/assets/Images/logo.png"
            alt="Stag.io logo"
            class="w-[130px] object-contain md:w-[150px]"
          />

          <h1 class="mt-3 text-center text-[17px] font-semibold text-[#4A4A4A] md:text-[19px]">
            Sign up into your account
          </h1>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="mx-auto mt-6 w-full max-w-[720px] flex-1">
          <div class="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
            <AuthInput v-model="name" label="Full Name :" placeholder="Enter your full name" />

            <AuthInput
              v-model="email"
              label="Email :"
              type="email"
              placeholder="example@email.com"
            />

            <AuthInput
              v-model="password"
              label="Password :"
              type="password"
              placeholder="********"
            />

            <AuthInput
              v-model="password_confirmation"
              label="Confirm Password :"
              type="password"
              placeholder="********"
            />
          </div>

          <div class="mt-5 max-w-[330px]">
            <AuthSelect v-model="role" label="Select the Role :" :options="roles" />
          </div>

          <p v-if="errorMessage" class="mt-4 text-sm font-medium text-red-500">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="mt-4 text-sm font-medium text-green-600">
            {{ successMessage }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="mt-6 h-[48px] w-[210px] rounded-[10px] bg-[#1846D0] text-[17px] font-semibold text-white shadow-[0_8px_14px_rgba(24,70,208,0.22)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{ loading ? 'Signing up...' : 'Sign up' }}
          </button>
        </form>

        <!-- Footer text -->
        <div
          class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pb-3 text-[14px] text-[#7C8395]"
        >
          <span>Stag.io</span>
          <span>-</span>
          <span>Internship</span>
          <span>Management</span>
          <span>Platform</span>
        </div>
      </div>

      <!-- Right side -->
      <div class="relative hidden h-screen bg-[#1846D0] lg:block">
        <div class="relative flex h-full w-full items-center justify-center overflow-hidden">
          <img
            src="@/assets/Images/Vector.png"
            alt="Background shape"
            class="w-[82%] max-w-[560px] object-contain"
          />

          <img
            src="@/assets/Images/photo.png"
            alt="Illustration"
            class="absolute w-[48%] max-w-[340px] object-contain"
          />
        </div>
      </div>
    </div>
  </div>
</template>
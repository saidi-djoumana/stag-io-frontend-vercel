<template>
  <CompanyLayout>
    <section class="w-full">
      <div class="mb-6">
        <h1 class="text-[25px] font-semibold text-white leading-none">
          Company Profile
        </h1>
        <p class="mt-3 text-[16px] text-[#B3B7C6]">
          Manage your company information and presentation.
        </p>
      </div>

      <div v-if="loading" class="text-[#B3B7C6] text-[15px]">
        Loading company profile...
      </div>

      <div
        v-if="errorMessage"
        class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 mb-6"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="!loading"
        class="w-full rounded-[14px] bg-[#1C1C1F] min-h-[760px] px-[42px] pt-[34px] pb-[34px] shadow-[0_0_40px_rgba(0,0,0,0.25)]"
      >
        <div class="flex justify-center">
          <ProfileAvatarUpload
            :imageSrc="avatarImage"
            @update:image="handleAvatarUpdate"
          />
        </div>

        <div
          v-if="successMessage"
          class="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300"
        >
          {{ successMessage }}
        </div>

        <div class="mt-[54px] ml-[2px]">
          <div class="flex flex-wrap gap-[18px]">
            <div class="w-[275px]">
              <ProfileInput
                v-model="form.companyName"
                placeholder="Company Name"
              />
            </div>

            <div class="w-[300px]">
              <ProfileSelect
                v-model="form.industry"
                placeholder="Industry"
                :options="industryOptions"
              />
            </div>

            <div class="w-[300px]">
              <ProfileInput
                v-model="form.location"
                placeholder="Location / City / Wilaya"
                type="text"
              />
            </div>

            <div class="w-[280px]">
              <ProfileInput
                v-model="form.website"
                placeholder="Website URL"
                type="text"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-[18px] mt-[34px]">
            <div class="w-[240px]">
              <ProfileSelect
                v-model="form.companySize"
                placeholder="Company Size"
                :options="companySizeOptions"
              />
            </div>
          </div>

          <div class="mt-[34px] w-full max-w-[920px]">
            <label class="block text-[#B3B7C6] text-[15px] mb-3">
              Company Description
            </label>

            <textarea
              v-model="form.description"
              placeholder="Write a short description about your company..."
              rows="6"
              class="w-full resize-none rounded-[10px] bg-[#26262A] border border-[#35363C] px-5 py-4 text-white text-[15px] outline-none placeholder:text-[#8D93A3] focus:border-[#4285F4] transition"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end mt-[90px] gap-5 pr-[2px]">
          <button
            type="button"
            class="h-[56px] px-10 rounded-[10px] bg-[#4285F4] text-white text-[17px] font-medium hover:bg-[#3579ea] transition disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleSave"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>

          <button
            type="button"
            class="h-[56px] px-9 rounded-[10px] border border-[#6C7280] text-[#E4E4E4] text-[17px] font-medium hover:bg-[#26262A] transition disabled:opacity-60 disabled:cursor-not-allowed"
            @click="handleCancel"
            :disabled="saving"
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  </CompanyLayout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import ProfileAvatarUpload from '@/components/company/ProfileAvatarUpload.vue'
import ProfileInput from '@/components/company/ProfileInput.vue'
import ProfileSelect from '@/components/company/ProfileSelect.vue'
import { getCompanyProfile, updateCompanyProfile } from '@/services/company'

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const avatarImage = ref('')

const form = reactive({
  companyName: '',
  industry: '',
  location: '',
  website: '',
  companySize: '',
  description: '',
})

const originalForm = reactive({
  companyName: '',
  industry: '',
  location: '',
  website: '',
  companySize: '',
  description: '',
})

const industryOptions = [
  'Technology',
  'Finance',
  'Education',
  'Healthcare',
  'Marketing',
  'Design',
]

const companySizeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
]

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

const getProfileStorageKey = () => {
  const userId = getCurrentUserId()
  return userId ? `company_profile_local_${userId}` : null
}

const getAvatarStorageKey = () => {
  const userId = getCurrentUserId()
  return userId ? `company_profile_avatar_local_${userId}` : null
}

const saveProfileToLocalStorage = (profile = {}) => {
  const profileKey = getProfileStorageKey()
  if (!profileKey) return

  localStorage.setItem(
    profileKey,
    JSON.stringify({
      company_name: profile?.company_name || form.companyName,
      industry: profile?.industry || form.industry,
      location: profile?.location || form.location,
      website_url: profile?.website_url || form.website,
      company_size: profile?.company_size || form.companySize,
      description: profile?.description || form.description,
    })
  )
}

const loadAvatarFromLocalStorage = () => {
  const avatarKey = getAvatarStorageKey()

  if (!avatarKey) {
    avatarImage.value = ''
    return
  }

  avatarImage.value = localStorage.getItem(avatarKey) || ''
}

const saveAvatarToLocalStorage = () => {
  const avatarKey = getAvatarStorageKey()
  if (!avatarKey) return

  if (avatarImage.value) {
    localStorage.setItem(avatarKey, avatarImage.value)
  } else {
    localStorage.removeItem(avatarKey)
  }
}

const applyProfileToForm = (profile) => {
  form.companyName = profile?.company_name || ''
  form.industry = profile?.industry || ''
  form.location = profile?.location || ''
  form.website = profile?.website_url || ''
  form.companySize = profile?.company_size || ''
  form.description = profile?.description || ''
}

const updateOriginalForm = () => {
  originalForm.companyName = form.companyName
  originalForm.industry = form.industry
  originalForm.location = form.location
  originalForm.website = form.website
  originalForm.companySize = form.companySize
  originalForm.description = form.description
}

const loadCompanyProfile = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const profile = await getCompanyProfile()

    applyProfileToForm(profile)
    updateOriginalForm()
    saveProfileToLocalStorage(profile)

    window.dispatchEvent(new Event('company-profile-updated'))
  } catch (error) {
    console.error('Failed to load company profile:', error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message || 'Failed to load company profile.'
  } finally {
    loadAvatarFromLocalStorage()
    loading.value = false
  }
}

const handleAvatarUpdate = (newImage) => {
  avatarImage.value = newImage || ''
  saveAvatarToLocalStorage()

  window.dispatchEvent(new Event('company-profile-updated'))
}

const handleSave = async () => {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const payload = {
    company_name: form.companyName,
    industry: form.industry,
    location: form.location,
    website_url: form.website,
    company_size: form.companySize,
    description: form.description,
  }

  try {
    const updatedProfile = await updateCompanyProfile(payload)

    applyProfileToForm(updatedProfile)
    updateOriginalForm()
    saveProfileToLocalStorage(updatedProfile)

    successMessage.value = 'Profile saved.'
    window.dispatchEvent(new Event('company-profile-updated'))
  } catch (error) {
    console.error('Failed to save company profile:', error.response?.data || error)

    if (error.response?.status === 422) {
      const errors = error.response.data.errors

      if (errors) {
        errorMessage.value = Object.values(errors).flat()[0]
      } else {
        errorMessage.value =
          error.response.data.message || 'Invalid profile information.'
      }
    } else {
      errorMessage.value =
        error.response?.data?.message || 'Failed to save company profile.'
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  form.companyName = originalForm.companyName
  form.industry = originalForm.industry
  form.location = originalForm.location
  form.website = originalForm.website
  form.companySize = originalForm.companySize
  form.description = originalForm.description

  loadAvatarFromLocalStorage()

  errorMessage.value = ''
  successMessage.value = ''
}

onMounted(() => {
  loadCompanyProfile()
})
</script>
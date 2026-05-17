<template>
  <div class="min-h-screen bg-[#0a0a0b] text-white">
    <StudentSidebar />

    <div class="ml-0 md:ml-[290px] min-h-screen px-4 md:px-8 py-4 md:py-7">
      <StudentTopbar />

      <div class="mt-6 mb-6">
        <h1 class="text-[24px] md:text-[30px] font-semibold text-white">My Digital Cv</h1>
      </div>

      <div
        class="rounded-[22px] bg-gradient-to-r from-[#1b1b1d] to-[#18181a] shadow-[0_10px_40px_rgba(0,0,0,0.35)] p-4 md:p-7"
      >
        <form class="space-y-7" @submit.prevent="handleSave">
          <div class="flex items-center gap-4 md:gap-6">
            <div class="relative">
              <img
                :src="previewImage || defaultAvatar"
                alt="Profile"
                class="w-[90px] h-[90px] md:w-[105px] md:h-[105px] rounded-full object-cover border-4 border-white/10"
              />

              <label
                for="profile-upload"
                class="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center cursor-pointer shadow-md hover:opacity-90 transition"
              >
                <span class="text-white text-sm">✎</span>
              </label>

              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageChange"
              />
            </div>

            <div>
              <h2 class="text-[20px] md:text-[24px] font-semibold text-white">
                {{ form.full_name || 'Student Name' }}
              </h2>
              <p class="text-gray-400 text-[15px] md:text-[17px]">
                {{ form.email || 'student@email.com' }}
              </p>
            </div>
          </div>

          <CvInputField
            label="Full Name"
            v-model="form.full_name"
            placeholder="Enter your full name"
          />

          <CvInputField
            label="Email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
          />

          <CvInputField
            label="Phone Number"
            v-model="form.phone"
            placeholder="Enter your phone number"
          />

          <CvInputField
            label="Wilaya"
            v-model="form.wilaya"
            placeholder="Enter your wilaya"
          />

          <CvInputField
            label="University"
            v-model="form.university"
            placeholder="Enter your university"
          />

          <CvInputField
            label="Field of Study / Major"
            v-model="form.field_of_study"
            placeholder="Enter your field of study"
          />

          <CvInputField
            label="Academic Level"
            v-model="form.academic_level"
            placeholder="Enter your academic level"
          />

          <SkillsInput label="Technical Skills" v-model="form.skills" />

          <div>
            <label class="block text-[16px] md:text-[17px] text-[#d7d9e0] mb-2">
              Previous Internship Experiences
            </label>

            <textarea
              v-model="form.previous_internship_experiences"
              rows="6"
              maxlength="5000"
              placeholder="Describe your previous internships, projects, missions, technologies used, or professional experiences..."
              class="w-full rounded-xl bg-[#101012] border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#3b82f6] transition resize-none"
            ></textarea>

            <p class="text-xs text-gray-500 mt-2">
              {{ form.previous_internship_experiences.length }}/5000 characters
            </p>
          </div>

          <CvInputField
            label="Portfolio / GitHub Link"
            v-model="form.portfolio_link"
            placeholder="Enter your portfolio or GitHub link"
          />

          <div class="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="h-[50px] px-7 rounded-xl bg-[#3b82f6] text-white text-[17px] font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>

            <button
              type="button"
              @click="handleCancel"
              class="h-[50px] px-7 rounded-xl border border-gray-500 text-[#d7d9e0] text-[17px] font-medium hover:bg-[#232325] transition"
            >
              Cancel
            </button>
          </div>

          <p v-if="successMessage" class="text-green-400 text-sm">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="text-red-400 text-sm">
            {{ errorMessage }}
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import StudentSidebar from '@/components/student/StudentSidebar.vue'
import StudentTopbar from '@/components/common/topBar.vue'
import CvInputField from '@/components/student/CvInputField.vue'
import SkillsInput from '@/components/student/SkillsInput.vue'
import { getStudentProfile, updateStudentProfile } from '@/services/student'

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const defaultAvatar =
  'https://ui-avatars.com/api/?name=Student&background=ff5a5f&color=fff'

const previewImage = ref('')
const originalPreviewImage = ref('')
const originalForm = ref({})

const form = reactive({
  full_name: '',
  email: '',
  phone: '',
  wilaya: '',
  university: '',
  field_of_study: '',
  academic_level: '',
  skills: [],
  previous_internship_experiences: '',
  portfolio_link: '',
})

const normalizeSkills = (skillsValue) => {
  if (!skillsValue) return []

  if (Array.isArray(skillsValue)) return skillsValue

  if (typeof skillsValue === 'string') {
    return skillsValue
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
  }

  return []
}

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

const clearForm = () => {
  form.full_name = ''
  form.email = ''
  form.phone = ''
  form.wilaya = ''
  form.university = ''
  form.field_of_study = ''
  form.academic_level = ''
  form.skills = []
  form.previous_internship_experiences = ''
  form.portfolio_link = ''
}

const hasProfileData = (profile) => {
  if (!profile) return false

  return Boolean(
    profile.full_name ||
      profile.email ||
      profile.phone ||
      profile.wilaya ||
      profile.university ||
      profile.field_of_study ||
      profile.academic_level ||
      (Array.isArray(profile.skills) && profile.skills.length > 0) ||
      profile.previous_internship_experiences ||
      profile.portfolio_link
  )
}

const emitProfileUpdated = () => {
  window.dispatchEvent(new Event('student-profile-updated'))
}

const setOriginalForm = () => {
  originalForm.value = JSON.parse(
    JSON.stringify({
      ...form,
      skills: normalizeSkills(form.skills),
    })
  )
}

const fillForm = (profile) => {
  form.full_name = profile.full_name || ''
  form.email = profile.email || ''
  form.phone = profile.phone || ''
  form.wilaya = profile.wilaya || ''
  form.university = profile.university || ''
  form.field_of_study = profile.field_of_study || ''
  form.academic_level = profile.academic_level || ''
  form.skills = normalizeSkills(profile.skills)
  form.previous_internship_experiences =
    profile.previous_internship_experiences || ''
  form.portfolio_link = profile.portfolio_link || ''

  setOriginalForm()
}

const getCurrentFormData = () => {
  return {
    full_name: form.full_name,
    email: form.email,
    phone: form.phone,
    wilaya: form.wilaya,
    university: form.university,
    field_of_study: form.field_of_study,
    academic_level: form.academic_level,
    skills: normalizeSkills(form.skills),
    previous_internship_experiences: form.previous_internship_experiences,
    portfolio_link: form.portfolio_link,
  }
}

const removeOldGlobalStorage = () => {
  localStorage.removeItem('digital_cv_data')
  localStorage.removeItem('digital_cv_profile_image')
}

const saveDraftLocally = () => {
  const { cvKey } = getStorageKeys()
  if (!cvKey) return

  localStorage.setItem(cvKey, JSON.stringify(getCurrentFormData()))
}

const loadDraftLocally = () => {
  const { cvKey } = getStorageKeys()
  if (!cvKey) return false

  const saved = localStorage.getItem(cvKey)
  if (!saved) return false

  try {
    const parsed = JSON.parse(saved)
    fillForm(parsed)
    return true
  } catch (error) {
    console.error('Failed to parse local CV draft:', error)
    return false
  }
}

const saveImageLocally = (image) => {
  const { imageKey } = getStorageKeys()
  if (!imageKey) return

  localStorage.setItem(imageKey, image)
}

const loadImageLocally = () => {
  const { imageKey } = getStorageKeys()
  if (!imageKey) return ''

  return localStorage.getItem(imageKey) || ''
}

const syncUserToLocalStorage = (profile) => {
  const existingUser = getStoredUser()

  localStorage.setItem(
    'user',
    JSON.stringify({
      ...existingUser,
      name: profile.full_name || existingUser.name || '',
      email: profile.email || existingUser.email || '',
      student_profile: profile,
    })
  )
}

const handleImageChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    previewImage.value = reader.result
    originalPreviewImage.value = reader.result
    saveImageLocally(reader.result)
    emitProfileUpdated()
  }

  reader.readAsDataURL(file)
}

const fetchProfile = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    removeOldGlobalStorage()

    const data = await getStudentProfile()
    const profile = data.profile || data

    if (hasProfileData(profile)) {
      fillForm(profile)
      saveDraftLocally()
      syncUserToLocalStorage(profile)
    } else {
      clearForm()
      setOriginalForm()
      loadDraftLocally()
    }

    const storedImage = loadImageLocally()
    if (storedImage) {
      previewImage.value = storedImage
      originalPreviewImage.value = storedImage
    } else {
      previewImage.value = ''
      originalPreviewImage.value = ''
    }

    emitProfileUpdated()
  } catch (error) {
    console.error('Failed to fetch profile:', error.response?.data || error)

    const loadedFromLocal = loadDraftLocally()
    const storedImage = loadImageLocally()

    if (storedImage) {
      previewImage.value = storedImage
      originalPreviewImage.value = storedImage
    } else {
      previewImage.value = ''
      originalPreviewImage.value = ''
    }

    if (!loadedFromLocal) {
      clearForm()
      setOriginalForm()
      errorMessage.value = 'Failed to load profile data.'
    }

    emitProfileUpdated()
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  try {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    const payload = getCurrentFormData()
    console.log('Payload before save:', payload)

    const data = await updateStudentProfile(payload)
    const updatedProfile = data.profile || payload

    setOriginalForm()
    originalPreviewImage.value = previewImage.value || ''

    saveDraftLocally()

    if (previewImage.value) {
      saveImageLocally(previewImage.value)
    }

    syncUserToLocalStorage(updatedProfile)
    emitProfileUpdated()

    successMessage.value = 'Your profile has been updated successfully.'

    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (error) {
    console.error('Failed to update profile:', error.response?.data || error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to save profile changes.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  form.full_name = originalForm.value.full_name || ''
  form.email = originalForm.value.email || ''
  form.phone = originalForm.value.phone || ''
  form.wilaya = originalForm.value.wilaya || ''
  form.university = originalForm.value.university || ''
  form.field_of_study = originalForm.value.field_of_study || ''
  form.academic_level = originalForm.value.academic_level || ''
  form.skills = [...(originalForm.value.skills || [])]
  form.previous_internship_experiences =
    originalForm.value.previous_internship_experiences || ''
  form.portfolio_link = originalForm.value.portfolio_link || ''

  previewImage.value = originalPreviewImage.value || ''
  errorMessage.value = ''
  successMessage.value = ''

  saveDraftLocally()

  if (previewImage.value) {
    saveImageLocally(previewImage.value)
  }

  syncUserToLocalStorage(getCurrentFormData())
  emitProfileUpdated()
}

onMounted(() => {
  fetchProfile()
})
</script>
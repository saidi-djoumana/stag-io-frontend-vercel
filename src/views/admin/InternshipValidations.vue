<template>
  <AdminLayout>
    <div class="min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-white text-[30px] md:text-[34px] font-semibold mb-2">
          Internship Validations
        </h1>
        <p class="text-[#C6C6C6] text-[16px]">
          Review and approve internship offers accepted by companies.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row justify-end gap-4 mb-10">
        <select
          v-model="selectedStatus"
          class="bg-[#2A2A2A] text-[#D1D1D1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#3B82F6] min-w-[170px]"
        >
         <option value="">Status: All</option>
<option value="Pending Company Decision">Pending Company Decision</option>
<option value="Accepted by Company">Accepted by Company</option>
<option value="Refused by Company">Refused by Company</option>
<option value="Pending Validation">Pending Validation</option>
<option value="Approved">Approved</option>
<option value="Rejected">Rejected</option>
        </select>

        <select
          v-model="selectedDepartment"
          class="bg-[#2A2A2A] text-[#D1D1D1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#3B82F6] min-w-[190px]"
        >
          <option value="">Department : All</option>
          <option
            v-for="department in departmentOptions"
            :key="department"
            :value="department"
          >
            {{ department }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-[#BDBDBD] text-[15px] mb-6">
        Loading validations...
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300"
      >
        {{ error }}
      </div>

      <!-- Table -->
      <div
        v-else
        class="rounded-[22px] bg-[#1E1E1E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Student
                </th>
                <th
                  class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4 whitespace-nowrap"
                >
                  Student ID
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  University / Department
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Company Name
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Internship Title
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Duration
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Status
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <ValidationRow
  v-for="item in filteredValidations"
  :key="item.id"
  :item="item"
  :show-decision-buttons="selectedStatus === 'Pending Validation'"
  @view-details="handleViewDetails"
  @approve="handleApprove"
  @reject="handleReject"
/>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredValidations.length === 0"
          class="flex items-center justify-center py-16 text-center"
        >
          <div>
            <h3 class="text-white text-xl font-semibold mb-2">No validations found</h3>
            <p class="text-[#BDBDBD]">
              Try changing the selected filters.
            </p>
          </div>
        </div>
      </div>

      <!-- View Details Modal -->
      <transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          @click="closeModal"
        >
          <div
            class="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-[#1E1E1E] p-6 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            @click.stop
          >
            <!-- Close -->
            <button
              type="button"
              class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition"
              @click="closeModal"
            >
              ✕
            </button>

            <!-- Modal header -->
            <div class="mb-6">
              <h2 class="text-white text-[24px] md:text-[28px] font-semibold mb-2">
                Application Details
              </h2>
              <p class="text-[#BDBDBD] text-[15px]">
                Review the selected application before taking an action.
              </p>
            </div>

            <!-- Status badge -->
            <div class="mb-6">
              <span
                class="inline-flex items-center rounded-full px-4 py-2 text-[14px] leading-none"
                :class="modalStatusClass"
              >
                {{ selectedApplication?.status }}
              </span>
            </div>

            <!-- Info cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">Student</p>
                <p class="text-white text-[16px] font-medium">
                  {{ selectedApplication?.student }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">Student ID</p>
                <p class="text-white text-[16px] font-medium">
                  {{ selectedApplication?.studentId }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">University / Department</p>
                <p class="text-white text-[16px] font-medium leading-6">
                  {{ selectedApplication?.department }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">Company</p>
                <p class="text-white text-[16px] font-medium">
                  {{ selectedApplication?.company }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">Internship Title</p>
                <p class="text-white text-[16px] font-medium leading-6">
                  {{ selectedApplication?.title }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="text-[#9CA3AF] text-[13px] mb-1">Duration</p>
                <p class="text-white text-[16px] font-medium">
                  {{ selectedApplication?.duration }}
                </p>
              </div>
            </div>

            <!-- Cover letter -->
            <div class="rounded-2xl bg-[#2A2A2A] p-5 mb-4">
              <p class="text-white text-[16px] font-semibold mb-3">Cover Letter</p>
              <p class="text-[#D1D1D1] text-[15px] leading-7 whitespace-pre-line">
                {{ selectedApplication?.coverLetter || 'No cover letter provided.' }}
              </p>
            </div>

            <!-- Admin note -->
            <div class="rounded-2xl bg-[#2A2A2A] p-5 mb-6">
              <p class="text-white text-[16px] font-semibold mb-3">Admin Note</p>
              <p class="text-[#D1D1D1] text-[15px] leading-7 whitespace-pre-line">
                {{ selectedApplication?.adminNote || 'No admin note.' }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                class="rounded-xl border border-white/10 px-5 py-3 text-white hover:bg-white/5 transition"
                @click="closeModal"
              >
                Close
              </button>

              <template v-if="selectedApplication?.rawStatus === 'selected'">
                <button
                  type="button"
                  class="rounded-xl bg-[#22C55E] px-5 py-3 text-white hover:bg-[#16A34A] transition"
                  @click="handleApprove(selectedApplication)"
                >
                  Approve
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-[#EF4444] px-5 py-3 text-white hover:bg-[#DC2626] transition"
                  @click="handleReject(selectedApplication)"
                >
                  Reject
                </button>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ValidationRow from '@/components/Admin/ValidationRow.vue'
import {
  getAdminApplications,
  validateAdminApplication,
  rejectAdminApplication,
  generateConvention,
} from '@/services/admin'

const loading = ref(true)
const error = ref('')
const selectedStatus = ref('')
const selectedDepartment = ref('')
const validations = ref([])

const selectedApplication = ref(null)
const showModal = ref(false)

const formatStatus = (status, application = null) => {
  switch (status) {
    case 'selected':
      return 'Pending Validation'

    case 'validated':
      return 'Approved'

    case 'rejected':
      return application?.admin_note
        ? 'Rejected by Admin'
        : 'Rejected by Student'

    case 'accepted':
      return 'Accepted by Company'

    case 'refused':
      return 'Refused by Company'

    case 'pending':
      return 'Pending Company Decision'

    default:
      return status || 'Unknown'
  }
}

const getStudentName = (application) => {
  return (
    application.student?.student_profile?.full_name ||
    application.student?.studentProfile?.full_name ||
    application.student?.full_name ||
    application.student?.name ||
    'Unknown Student'
  )
}

const getStudentDepartment = (application) => {
  const profile =
    application.student?.student_profile || application.student?.studentProfile

  const university = profile?.university || ''
  const field = profile?.field_of_study || profile?.department || ''

  if (university && field) return `${university} / ${field}`
  if (field) return field
  if (university) return university

  return 'N/A'
}

const getCompanyName = (application) => {
  return (
    application.offer?.company?.company_profile?.company_name ||
    application.offer?.company?.companyProfile?.company_name ||
    application.offer?.company?.company_name ||
    application.offer?.company?.name ||
    'Unknown Company'
  )
}

const getOfferTitle = (application) => {
  const offer = application.offer || {}

  return (
    offer.title ||
    offer.internship_title ||
    offer.position ||
    offer.job_title ||
    'N/A'
  )
}

const normalizeText = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const isFilled = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return true
}

const isNumericLike = (value) => {
  if (!isFilled(value)) return false
  return !Number.isNaN(Number(value))
}

const formatNumberUnit = (numberValue, unitValue) => {
  if (!isNumericLike(numberValue)) return null

  const numberText = String(Number(numberValue))
  const unitText = normalizeText(unitValue)

  if (!unitText) return numberText

  return `${numberText} ${unitText}`
}

const formatDateRange = (start, end) => {
  const startText = normalizeText(start)
  const endText = normalizeText(end)

  if (startText && endText) return `${startText} → ${endText}`
  if (startText) return `Starts ${startText}`
  if (endText) return `Until ${endText}`

  return null
}

const extractDurationFromObject = (obj, visited = new WeakSet()) => {
  if (!obj || typeof obj !== 'object') return null
  if (visited.has(obj)) return null
  visited.add(obj)

  const exactPairs = [
    ['duration_value', 'duration_unit'],
    ['durationValue', 'durationUnit'],
    ['internship_duration_value', 'internship_duration_unit'],
    ['internshipDurationValue', 'internshipDurationUnit'],
    ['period_value', 'period_unit'],
    ['periodValue', 'periodUnit'],
    ['length_value', 'length_unit'],
    ['lengthValue', 'lengthUnit'],
    ['number', 'unit'],
    ['value', 'unit'],
  ]

  for (const [valueKey, unitKey] of exactPairs) {
    const combined = formatNumberUnit(obj[valueKey], obj[unitKey])
    if (combined) return combined
  }

  const commonNumberKeys = [
    'duration',
    'duration_value',
    'durationValue',
    'internship_duration',
    'internshipDuration',
    'duration_months',
    'months',
    'weeks',
    'days',
    'period_value',
    'periodValue',
    'length',
    'length_value',
    'lengthValue',
    'number',
    'value',
  ]

  const commonUnitKeys = [
    'duration_unit',
    'durationUnit',
    'internship_duration_unit',
    'internshipDurationUnit',
    'period_unit',
    'periodUnit',
    'length_unit',
    'lengthUnit',
    'unit',
  ]

  for (const numberKey of commonNumberKeys) {
    for (const unitKey of commonUnitKeys) {
      const combined = formatNumberUnit(obj[numberKey], obj[unitKey])
      if (combined) return combined
    }
  }

  const directKeys = [
    'duration_text',
    'durationText',
    'internship_duration_text',
    'internshipDurationText',
    'period',
    'timeline',
    'length_text',
    'lengthText',
  ]

  for (const key of directKeys) {
    const value = obj[key]
    if (isFilled(value)) return normalizeText(value)
  }

  if (isNumericLike(obj.duration_months)) return `${Number(obj.duration_months)} months`
  if (isNumericLike(obj.months)) return `${Number(obj.months)} months`
  if (isNumericLike(obj.weeks)) return `${Number(obj.weeks)} weeks`
  if (isNumericLike(obj.days)) return `${Number(obj.days)} days`

  const dateRange = formatDateRange(
    obj.start_date || obj.startDate || obj.date_start || obj.begin_date,
    obj.end_date || obj.endDate || obj.date_end || obj.finish_date
  )
  if (dateRange) return dateRange

  for (const key of Object.keys(obj)) {
    const value = obj[key]

    if (value && typeof value === 'object') {
      const nested = extractDurationFromObject(value, visited)
      if (nested) return nested
    }
  }

  return null
}

const getOfferDuration = (application) => {
  const offer = application.offer || {}

  return (
    extractDurationFromObject(offer) ||
    extractDurationFromObject(application) ||
    'Not specified'
  )
}

const mapApplicationToRow = (application) => {
  return {
    id: application.id,
    rawStatus: application.status,
    student: getStudentName(application),
    studentId: application.student_id,
    department: getStudentDepartment(application),
    company: getCompanyName(application),
    title: getOfferTitle(application),
    duration: getOfferDuration(application),
   status: formatStatus(application.status, application),
    coverLetter: application.cover_letter || '',
    adminNote: application.admin_note || '',
    createdAt: application.created_at,
    original: application,
  }
}

const fetchApplications = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getAdminApplications()
    validations.value = (response.data || []).map(mapApplicationToRow)

    console.log('Admin applications:', response)
    console.log('First raw application:', response.data?.[0])
    console.log('First raw offer:', response.data?.[0]?.offer)
    console.log('Mapped validations:', validations.value)
  } catch (err) {
    console.error('Failed to fetch admin applications:', err.response?.data || err)
    error.value = 'Failed to load internship validations.'
  } finally {
    loading.value = false
  }
}

const departmentOptions = computed(() => {
  return [...new Set(validations.value.map((item) => item.department).filter(Boolean))]
})

const filteredValidations = computed(() => {
  return validations.value.filter((item) => {
    const matchesStatus =
      !selectedStatus.value || item.status === selectedStatus.value

    const matchesDepartment =
      !selectedDepartment.value || item.department === selectedDepartment.value

    return matchesStatus && matchesDepartment
  })
})

const modalStatusClass = computed(() => {
  if (!selectedApplication.value) return 'bg-gray-500 text-white'

  if (selectedApplication.value.status === 'Pending Validation') {
    return 'bg-[#FACC15] text-black'
  }
  if (selectedApplication.value.status === 'Approved') {
    return 'bg-[#22C55E] text-white'
  }
  if (selectedApplication.value.status === 'Rejected') {
    return 'bg-[#EF4444] text-white'
  }

  return 'bg-gray-500 text-white'
})

const handleViewDetails = (item) => {
  selectedApplication.value = item
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedApplication.value = null
}

const handleApprove = async (item) => {
  if (item.rawStatus !== 'selected') {
    alert('Only selected internships can be approved by admin.')
    return
  }

  try {
    // 1. Validate
    await validateAdminApplication(item.id)

    // 2. Generate agreement automatically
    const conventionResponse = await generateConvention(item.id)

    console.log('Convention generated:', conventionResponse)

    // 3. Update UI
    const index = validations.value.findIndex(
      (validation) => validation.id === item.id
    )

    if (index !== -1) {
      const updatedItem = {
        ...validations.value[index],
        rawStatus: 'validated',
        status: 'Approved',
      }

      validations.value[index] = updatedItem

      if (selectedApplication.value?.id === item.id) {
        selectedApplication.value = updatedItem
      }
    }

    // Optional: success message
    alert('Application approved & agreement generated successfully ✅')

  } catch (err) {
    console.error(err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to approve application.')
  }
}

const handleReject = async (item) => {
 if (item.rawStatus !== 'selected') {
    alert('Only accepted applications can be rejected by admin.')
    return
  }

  try {
    await rejectAdminApplication(item.id)

    const index = validations.value.findIndex((validation) => validation.id === item.id)
    if (index !== -1) {
      const updatedItem = {
        ...validations.value[index],
        rawStatus: 'rejected',
        status: 'Rejected',
      }

      validations.value[index] = updatedItem

      if (selectedApplication.value?.id === item.id) {
        selectedApplication.value = updatedItem
      }
    }
  } catch (err) {
    console.error('Failed to reject application:', err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to reject application.')
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
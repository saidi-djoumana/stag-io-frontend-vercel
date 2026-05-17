<template>
  <AdminLayout>
    <div class="min-h-screen">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-white text-[30px] md:text-[34px] font-semibold mb-2">
          Internship Agreements
        </h1>
        <p class="text-[#C6C6C6] text-[16px]">
          Generate and manage internship agreement documents.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-[#BDBDBD] text-[15px] mb-6">
        Loading agreements...
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
                  Student Name
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
                  Validation Date
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Agreement Status
                </th>
                <th class="text-left text-[#D8D8D8] text-[15px] font-semibold px-4 pb-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <AgreementRow
                v-for="item in agreements"
                :key="item.id"
                :item="item"
                @regenerate="handleRegenerate"
                @download="handleDownload"
              />
            </tbody>
          </table>
        </div>

        <div
          v-if="agreements.length === 0"
          class="flex items-center justify-center py-16 text-center"
        >
          <div>
            <h3 class="text-white text-xl font-semibold mb-2">No agreements found</h3>
            <p class="text-[#BDBDBD]">
              Internship agreements will appear here once generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AgreementRow from '@/components/Admin/AgreementRow.vue'
import {
  getAdminConventions,
  generateConvention,
  downloadConventionPdf,
} from '@/services/admin'

const agreements = ref([])
const loading = ref(true)
const error = ref('')

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

const formatDate = (value) => {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-CA')
}

const getStudentName = (convention) => {
  const application = convention.application || {}
  const student = application.student || {}

  return (
    student.student_profile?.full_name ||
    student.studentProfile?.full_name ||
    student.full_name ||
    student.name ||
    'Unknown Student'
  )
}

const getCompanyName = (convention) => {
  const application = convention.application || {}
  const offer = application.offer || {}
  const company = offer.company || {}

  return (
    company.company_profile?.company_name ||
    company.companyProfile?.company_name ||
    company.company_name ||
    company.name ||
    'Unknown Company'
  )
}

const getInternshipTitle = (convention) => {
  const application = convention.application || {}
  const offer = application.offer || {}

  return (
    offer.title ||
    offer.internship_title ||
    offer.position ||
    offer.job_title ||
    'N/A'
  )
}

const getDuration = (convention) => {
  const application = convention.application || {}
  const offer = application.offer || {}

  return (
    extractDurationFromObject(offer) ||
    extractDurationFromObject(application) ||
    'Not specified'
  )
}

const mapConventionToRow = (convention) => {
  const application = convention.application || {}

  return {
    id: convention.id,
    applicationId: application.id,
    conventionNumber: convention.convention_number || '',
    studentName: getStudentName(convention),
    companyName: getCompanyName(convention),
    internshipTitle: getInternshipTitle(convention),
    duration: getDuration(convention),
    validationDate: formatDate(
      application.validated_at ||
      convention.created_at ||
      application.updated_at
    ),
    status: 'Generated',
    raw: convention,
  }
}

const fetchAgreements = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getAdminConventions()
    agreements.value = (response.data || []).map(mapConventionToRow)

    console.log('Admin conventions response:', response)
    console.log('Mapped agreements:', agreements.value)
  } catch (err) {
    console.error('Failed to load agreements:', err.response?.data || err)
    error.value = 'Failed to load internship agreements.'
  } finally {
    loading.value = false
  }
}

const getFilenameFromHeaders = (headers, fallback = 'agreement.pdf') => {
  const disposition = headers?.['content-disposition'] || headers?.['Content-Disposition']
  if (!disposition) return fallback

  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/)
  const filename = decodeURIComponent(match?.[1] || match?.[2] || '')

  return filename || fallback
}

const handleDownload = async (item) => {
  try {
    const response = await downloadConventionPdf(item.id)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = fileURL
    link.download = getFilenameFromHeaders(
      response.headers,
      item.conventionNumber ? `${item.conventionNumber}.pdf` : `convention-${item.id}.pdf`
    )

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(fileURL)
  } catch (err) {
    console.error('Failed to download agreement:', err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to download agreement.')
  }
}

const handleRegenerate = async (item) => {
  if (!item.applicationId) {
    alert('Application ID is missing for this agreement.')
    return
  }

  try {
    const response = await generateConvention(item.applicationId)

    alert(response.message || 'Agreement regenerated successfully.')

    await fetchAgreements()
  } catch (err) {
    console.error('Failed to regenerate agreement:', err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to regenerate agreement.')
  }
}

onMounted(() => {
  fetchAgreements()
})
</script>
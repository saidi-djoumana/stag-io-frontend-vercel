<template>
  <div class="bg-[#17171b] rounded-2xl p-6 shadow-md">
    <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <h2 class="text-[20px] font-semibold">My Conventions</h2>

      <p v-if="conventions.length" class="text-sm text-gray-400">
        {{ conventions.length }} convention<span v-if="conventions.length !== 1">s</span>
      </p>
    </div>

    <div class="bg-[#23324a] rounded-2xl p-6">
      <!-- IF CONVENTIONS EXIST -->
      <div v-if="conventions.length" class="space-y-4">
        <div
          v-for="convention in conventions"
          :key="convention.id"
          class="bg-[#43506a] rounded-xl px-5 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        >
          <div>
            <h3 class="text-[18px] font-semibold">
              {{ convention.convention_number || `Convention #${convention.id}` }}
            </h3>

            <p class="text-gray-200">
              Generated on {{ formatDate(convention.generated_at || convention.created_at) }}
            </p>

            <p
              v-if="getOfferTitle(convention)"
              class="text-gray-300 text-sm mt-1"
            >
              Internship: {{ getOfferTitle(convention) }}
            </p>

            <p
              v-if="getCompanyName(convention)"
              class="text-gray-300 text-sm mt-1"
            >
              Company: {{ getCompanyName(convention) }}
            </p>

            <div class="mt-3">
              <StatusBadge status="Validated" />
            </div>
          </div>

          <button
            type="button"
            @click="downloadConvention(convention)"
            :disabled="downloadingId === convention.id"
            class="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] transition text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download class="w-4 h-4" />
            {{ downloadingId === convention.id ? 'Downloading...' : 'Download Convention' }}
          </button>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <p v-else class="text-center text-gray-300 mt-2">
        No convention available at the moment.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import StatusBadge from './StatusBadge.vue'
import { downloadStudentConventionPdf } from '@/services/student'

defineProps({
  conventions: {
    type: Array,
    default: () => [],
  },
})

const downloadingId = ref(null)

const formatDate = (date) => {
  if (!date) return 'N/A'

  const parsedDate = new Date(date)

  if (isNaN(parsedDate.getTime())) return 'N/A'

  return parsedDate.toLocaleDateString('en-GB')
}

const getFilenameFromHeaders = (headers, fallback = 'convention.pdf') => {
  const disposition =
    headers?.['content-disposition'] || headers?.['Content-Disposition']

  if (!disposition) return fallback

  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/)
  const filename = decodeURIComponent(match?.[1] || match?.[2] || '')

  return filename || fallback
}

const getOfferTitle = (convention) => {
  return convention?.application?.offer?.title || ''
}

const getCompanyName = (convention) => {
  return (
    convention?.application?.offer?.company?.company_profile?.company_name ||
    convention?.application?.offer?.company?.company_name ||
    convention?.application?.offer?.company?.name ||
    ''
  )
}

const downloadConvention = async (convention) => {
  if (!convention?.id) {
    alert('Convention ID is missing.')
    return
  }

  downloadingId.value = convention.id

  try {
    const response = await downloadStudentConventionPdf(convention.id)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = fileURL
    link.download = getFilenameFromHeaders(
      response.headers,
      convention?.convention_number
        ? `${convention.convention_number}.pdf`
        : `convention-${convention.id}.pdf`
    )

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(fileURL)
  } catch (error) {
    console.error('Failed to download convention:', error.response?.data || error)
    alert(error.response?.data?.message || 'Failed to download convention.')
  } finally {
    downloadingId.value = null
  }
}
</script>
<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentLayout from '@/layouts/StudentLayout.vue'
import StudentTopbar from '@/components/common/topBar.vue'
import { getStudentApplications, finalizeInternshipChoice } from '@/services/student'

const loading = ref(false)
const choosingId = ref(null)
const searchQuery = ref('')
const applications = ref([])

const message = ref('')
const errorMessage = ref('')

const today = new Date()
today.setHours(0, 0, 0, 0)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-GB')
}

const normalizeDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const addDurationToDate = (startDate, durationValue, durationUnit) => {
  if (!startDate || !durationValue) return null

  const endDate = new Date(startDate)

  if (durationUnit === 'weeks') {
    endDate.setDate(endDate.getDate() + Number(durationValue) * 7)
  } else {
    endDate.setMonth(endDate.getMonth() + Number(durationValue))
  }

  endDate.setHours(0, 0, 0, 0)
  return endDate
}

const getCompanyName = (app) => {
  return (
    app.offer?.company?.company_profile?.company_name ||
    app.offer?.company?.companyName ||
    app.offer?.company?.name ||
    app.offer?.company_name ||
    'Company not available'
  )
}

const getInternshipStartDate = (app) => {
  return app.internship_starts_at || app.offer?.internship_starts_at || null
}

const getInternshipEndDate = (app) => {
  if (app.internship_ends_at) return app.internship_ends_at

  const startDate = normalizeDate(app.offer?.internship_starts_at)
  const calculatedEndDate = addDurationToDate(
    startDate,
    app.offer?.duration_value,
    app.offer?.duration_unit
  )

  return calculatedEndDate ? calculatedEndDate.toISOString().slice(0, 10) : null
}

const isInternshipFinished = (app) => {
  const endDate = normalizeDate(getInternshipEndDate(app))
  if (!endDate) return false
  return endDate < today
}

const doPeriodsOverlap = (firstStart, firstEnd, secondStart, secondEnd) => {
  if (!firstStart || !firstEnd || !secondStart || !secondEnd) return false
  return firstStart <= secondEnd && firstEnd >= secondStart
}

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const activeInternships = computed(() => {
  return applications.value.filter((app) => {
    const status = app.status?.toLowerCase()
    return (
      (status === 'selected' || status === 'validated') &&
      !isInternshipFinished(app)
    )
  })
})

const overlapsWithActiveInternship = (app) => {
  const appStart = normalizeDate(getInternshipStartDate(app))
  const appEnd = normalizeDate(getInternshipEndDate(app))

  return activeInternships.value.some((activeApp) => {
    if (activeApp.id === app.id) return false

    const activeStart = normalizeDate(getInternshipStartDate(activeApp))
    const activeEnd = normalizeDate(getInternshipEndDate(activeApp))

    return doPeriodsOverlap(appStart, appEnd, activeStart, activeEnd)
  })
}

const visibleApplications = computed(() => {
  let list = applications.value.filter((app) => {
    const status = app.status?.toLowerCase()

    if (isInternshipFinished(app)) return false

    return ['accepted', 'selected', 'validated'].includes(status)
  })

  if (!normalizedSearchQuery.value) return list

  return list.filter((app) => {
    const searchableText = [
      app.offer?.title,
      getCompanyName(app),
      app.offer?.location,
      app.offer?.domain,
      app.offer?.description,
      app.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedSearchQuery.value)
  })
})

const canChooseApplication = (app) => {
  const status = app.status?.toLowerCase()

  if (status !== 'accepted') return false
  if (isInternshipFinished(app)) return false
  if (overlapsWithActiveInternship(app)) return false

  return true
}

const getChoiceBlockedReason = (app) => {
  const status = app.status?.toLowerCase()

  if (status === 'selected') return 'Waiting for admin validation'
  if (status === 'validated') return 'Validated internship'
  if (status === 'accepted' && overlapsWithActiveInternship(app)) {
    return 'This internship overlaps with your current internship'
  }

  return 'Not available for selection'
}

const getStatusClass = (status) => {
  const normalized = status?.toLowerCase()

  if (normalized === 'validated') return 'bg-green-500/10 text-green-300'
  if (normalized === 'selected') return 'bg-blue-500/10 text-blue-300'
  if (normalized === 'accepted') return 'bg-yellow-500/10 text-yellow-300'

  return 'bg-gray-500/10 text-gray-300'
}

const loadApplications = async () => {
  loading.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const res = await getStudentApplications()
    applications.value = res.data || res || []
  } catch (error) {
    console.error('Accepted internships error:', error.response?.data || error)
    errorMessage.value = 'Failed to load your accepted internships.'
  } finally {
    loading.value = false
  }
}

const handleChooseInternship = async (app) => {
  if (choosingId.value) return

  if (!canChooseApplication(app)) {
    errorMessage.value = getChoiceBlockedReason(app)
    return
  }

  const confirmed = confirm(
    'Are you sure you want to choose this internship as your final choice? Overlapping accepted internships will be closed automatically.'
  )

  if (!confirmed) return

  choosingId.value = app.id
  errorMessage.value = ''
  message.value = ''

  try {
    const res = await finalizeInternshipChoice(app.id)

    message.value =
      res.message || 'Your final internship choice has been saved successfully.'

    await loadApplications()
  } catch (error) {
    console.error('Finalize choice error:', error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message || 'Failed to save your final choice.'
  } finally {
    choosingId.value = null
  }
}

onMounted(() => {
  loadApplications()
})
</script>

<template>
  <StudentLayout>
    <div class="space-y-6">
      <StudentTopbar
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        searchPlaceholder="Search internships..."
      />

      <section>
        <h1 class="text-[24px] md:text-[30px] font-bold mb-2">
          Accepted Internships
        </h1>

        <p class="text-gray-400 max-w-3xl">
          Here you can see accepted, selected, and validated internships. Finished internships are hidden. Accepted internships that overlap with your current internship stay visible, but cannot be selected.
        </p>
      </section>

      <div
        v-if="message"
        class="rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300"
      >
        {{ message }}
      </div>

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300"
      >
        {{ errorMessage }}
      </div>

      <section>
        <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 class="text-[20px] font-semibold">
            Your internship choices
          </h2>

          <p v-if="searchQuery.trim()" class="text-sm text-gray-400">
            {{ visibleApplications.length }}
            result<span v-if="visibleApplications.length !== 1">s</span>
            found
          </p>
        </div>

        <div v-if="loading" class="text-gray-400">
          Loading internships...
        </div>

        <div
          v-else-if="visibleApplications.length"
          class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <article
            v-for="app in visibleApplications"
            :key="app.id"
            class="rounded-3xl bg-[#17171b] p-6 shadow-md border border-white/5 flex flex-col justify-between gap-5"
          >
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 class="text-lg font-bold text-white">
                    {{ app.offer?.title || `Offer #${app.offer_id}` }}
                  </h3>

                  <p class="text-sm text-gray-400 mt-1">
                    {{ getCompanyName(app) }}
                  </p>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                  :class="getStatusClass(app.status)"
                >
                  {{ app.status }}
                </span>
              </div>

              <div class="space-y-2 text-sm text-gray-300">
                <p>
                  <span class="text-gray-500">Location:</span>
                  {{ app.offer?.location || 'N/A' }}
                </p>

                <p>
                  <span class="text-gray-500">Domain:</span>
                  {{ app.offer?.domain || 'N/A' }}
                </p>

                <p>
                  <span class="text-gray-500">Start date:</span>
                  {{ formatDate(getInternshipStartDate(app)) }}
                </p>

                <p>
                  <span class="text-gray-500">End date:</span>
                  {{ formatDate(getInternshipEndDate(app)) }}
                </p>

                <p>
                  <span class="text-gray-500">Duration:</span>
                  {{ app.offer?.duration_value || 'N/A' }}
                  {{ app.offer?.duration_unit || '' }}
                </p>

                <p>
                  <span class="text-gray-500">Applied on:</span>
                  {{ formatDate(app.created_at) }}
                </p>
              </div>

              <p
                v-if="app.status?.toLowerCase() === 'accepted' && overlapsWithActiveInternship(app)"
                class="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                This accepted internship overlaps with your current internship, so you cannot choose it.
              </p>

              <p class="text-sm text-gray-400 mt-4 line-clamp-3">
                {{ app.offer?.description || 'No description available.' }}
              </p>
            </div>

            <button
              v-if="app.status?.toLowerCase() === 'accepted'"
              type="button"
              class="w-full rounded-2xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="canChooseApplication(app)
                ? 'bg-[#1846D0] text-white hover:bg-[#1238aa]'
                : 'bg-white/5 text-gray-400'"
              :disabled="choosingId === app.id || !canChooseApplication(app)"
              @click="handleChooseInternship(app)"
            >
              <span v-if="choosingId === app.id">Saving choice...</span>
              <span v-else-if="canChooseApplication(app)">Choose this internship</span>
              <span v-else>Cannot choose this internship</span>
            </button>

            <div
              v-else
              class="w-full rounded-2xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-gray-300"
            >
              {{ getChoiceBlockedReason(app) }}
            </div>
          </article>
        </div>

        <div
          v-else
          class="rounded-3xl bg-[#17171b] p-6 text-gray-400 shadow-md"
        >
          You do not have accepted or active internships to display.
        </div>
      </section>
    </div>
  </StudentLayout>
</template>
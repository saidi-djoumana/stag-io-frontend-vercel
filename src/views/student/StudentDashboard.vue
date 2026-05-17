<script setup>
import { ref, onMounted, computed } from 'vue'
import StudentLayout from '@/layouts/StudentLayout.vue'
import StudentTopbar from '@/components/common/topBar.vue'
import DashboardStatCard from '@/components/student/DashboardStatCard.vue'
import InternshipCard from '@/components/student/InternshipCard.vue'
import ApplicationsTable from '@/components/student/ApplicationsTable.vue'
import ConventionCard from '@/components/student/ConventionCard.vue'
import {
  getStudentProfile,
  getStudentApplications,
  getOffers,
  getCompanyById,
  getStudentConventions,
  applyToOffer,
} from '@/services/student'

const studentName = ref('')
const loading = ref(false)
const applyingOfferId = ref(null)
const searchQuery = ref('')

const stats = ref({
  sent: 0,
  accepted: 0,
  pending: 0,
  rejected: 0,
})

const internships = ref([])
const applications = ref([])
const conventions = ref([])

const appliedOfferIds = computed(() =>
  applications.value.map((app) => app.offerId).filter(Boolean)
)

const normalizedSearchQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredInternships = computed(() => {
  if (!normalizedSearchQuery.value) {
    return internships.value
  }

  return internships.value.filter((offer) => {
    const searchableText = [
      offer.title,
      offer.company,
      offer.location,
      offer.description,
      ...(Array.isArray(offer.tags) ? offer.tags : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedSearchQuery.value)
  })
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) return 'N/A'

  return date.toLocaleDateString('en-GB')
}

const capitalizeStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const getSafeCompanyName = (offer, companyRes = null) => {
  return (
    offer?.company?.company_profile?.company_name ||
    offer?.company?.company_name ||
    offer?.user?.company_profile?.company_name ||
    offer?.user?.company_name ||
    companyRes?.company_name ||
    companyRes?.company_profile?.company_name ||
    companyRes?.user?.company_profile?.company_name ||
    companyRes?.data?.company_name ||
    companyRes?.data?.company_profile?.company_name ||
    companyRes?.data?.user?.company_profile?.company_name ||
    'Company not available'
  )
}

const loadStudentProfile = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const profileRes = await getStudentProfile()

    studentName.value =
      savedUser?.name ||
      savedUser?.full_name ||
      savedUser?.student_profile?.full_name ||
      profileRes?.full_name ||
      profileRes?.student_profile?.full_name ||
      profileRes?.student?.full_name ||
      profileRes?.user?.full_name ||
      profileRes?.data?.full_name ||
      profileRes?.data?.student_profile?.full_name ||
      profileRes?.data?.student?.full_name ||
      profileRes?.data?.user?.full_name ||
      'Student'
  } catch (error) {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')

    studentName.value =
      savedUser?.name ||
      savedUser?.full_name ||
      savedUser?.student_profile?.full_name ||
      'Student'

    console.error('Student profile error:', error.response?.data || error)
  }
}

const loadStudentApplications = async () => {
  const appRes = await getStudentApplications()
  const rawApplications = appRes.data || appRes || []

  stats.value.sent = rawApplications.length
  stats.value.accepted = rawApplications.filter(
    (app) => app.status?.toLowerCase() === 'accepted'
  ).length
  stats.value.pending = rawApplications.filter(
    (app) => app.status?.toLowerCase() === 'pending'
  ).length
  stats.value.rejected = rawApplications.filter(
    (app) =>
      app.status?.toLowerCase() === 'rejected' ||
      app.status?.toLowerCase() === 'refused'
  ).length

  applications.value = rawApplications.map((app) => ({
    id: app.id,
    offerId: app.offer_id,
    internship: app.offer?.title || `Offer #${app.offer_id}`,
    company:
      app.offer?.company?.company_profile?.company_name ||
      app.offer?.company?.company_name ||
      app.offer?.user?.company_profile?.company_name ||
      'Not available yet',
    appliedOn: formatDate(app.created_at),
    status: capitalizeStatus(app.status),
  }))
}

const loadOffers = async () => {
  const offersRes = await getOffers()
  const rawOffers = offersRes.data || offersRes || []

  const offersWithCompanies = await Promise.all(
    rawOffers.map(async (offer) => {
      let companyRes = null

      try {
        if (offer.user_id) {
          companyRes = await getCompanyById(offer.user_id)
        }
      } catch (error) {
        console.error(`Company fetch failed for user_id ${offer.user_id}:`, error)
      }

     return {
  id: offer.id,
  title: offer.title || 'Untitled internship',
  company: getSafeCompanyName(offer, companyRes),
  location: offer.location || 'Location not specified',

  domain: offer.domain,
  type: offer.type,
  durationUnit: offer.duration_unit,
  durationValue: offer.duration_value,
  deadline: offer.deadline,
  internshipStartsAt: offer.internship_starts_at,
  status: offer.status,

  tags: Array.isArray(offer.required_skills)
    ? offer.required_skills
    : [],

  description:
    offer.description || 'No description available.'
}
    })
  )

  internships.value = offersWithCompanies
}

const loadConventions = async () => {
  try {
    const res = await getStudentConventions()

    conventions.value = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
        ? res
        : []
  } catch (error) {
    if (error.response?.status === 404) {
      conventions.value = []
      return
    }

    console.error('Conventions error:', error.response?.data || error)
  }
}

const handleApply = async (offerId) => {
  if (applyingOfferId.value) return

  try {
    applyingOfferId.value = offerId
    await applyToOffer(offerId)
    await loadStudentApplications()
  } catch (error) {
    console.error('Apply error:', error.response?.data || error)

    const message =
      error.response?.data?.message || 'Failed to apply to this offer.'

    alert(message)
  } finally {
    applyingOfferId.value = null
  }
}

const loadDashboardData = async () => {
  loading.value = true

  try {
  await Promise.all([
  loadStudentProfile(),
  loadStudentApplications(),
  loadOffers(),
  loadConventions(),
])
  } catch (error) {
    console.error('Dashboard error:', error.response?.data || error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <StudentLayout>
    <div class="space-y-6">
      <StudentTopbar
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        searchPlaceholder="Search internships by title, company, location, or skill..."
      />

      <section>
        <h1 class="text-[24px] md:text-[30px] font-bold mb-5">
          Welcome back, {{ studentName }}
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <DashboardStatCard title="Applications Sent" :value="stats.sent" />
          <DashboardStatCard title="Accepted" :value="stats.accepted" />
          <DashboardStatCard title="Pending" :value="stats.pending" />
          <DashboardStatCard title="Rejected" :value="stats.rejected" />
        </div>
      </section>

      <section>
        <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <h2 class="text-[20px] font-semibold">Available Internships</h2>

          <p
            v-if="searchQuery.trim()"
            class="text-sm text-gray-400"
          >
            {{ filteredInternships.length }} result<span v-if="filteredInternships.length !== 1">s</span>
            found for "<span class="text-white">{{ searchQuery }}</span>"
          </p>
        </div>

        <div v-if="loading" class="text-gray-400">
          Loading offers...
        </div>

        <div
          v-else-if="filteredInternships.length"
          class="grid grid-cols-1 xl:grid-cols-3 gap-6"
        >
          <InternshipCard
  v-for="item in filteredInternships"
  :key="item.id"
  :id="item.id"
  :title="item.title"
  :company="item.company"
  :location="item.location"
  :tags="item.tags"
  :description="item.description"

  :domain="item.domain"
  :type="item.type"
  :durationUnit="item.durationUnit"
  :durationValue="item.durationValue"
  :deadline="item.deadline"
  :internshipStartsAt="item.internshipStartsAt"
  :status="item.status"

  :loading="applyingOfferId === item.id"
  :alreadyApplied="appliedOfferIds.includes(item.id)"
  @apply="handleApply(item.id)"
/>
        </div>

        <div
          v-else-if="searchQuery.trim()"
          class="bg-[#17171b] rounded-2xl p-6 text-gray-400 shadow-md"
        >
          No internships match your search.
        </div>

        <div
          v-else
          class="bg-[#17171b] rounded-2xl p-6 text-gray-400 shadow-md"
        >
          No available offers
        </div>
      </section>

      <ApplicationsTable :applications="applications" />

    <ConventionCard :conventions="conventions" />
    </div>
  </StudentLayout>
</template>
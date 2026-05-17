<template>
  <CompanyLayout>
    <section class="space-y-8">
      <!-- Welcome -->
      <div>
        <h1 class="text-[22px] md:text-[24px] font-semibold text-white">
          Welcome back, {{ companyName }}
        </h1>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-gray-400 text-[15px]">
        Loading dashboard...
      </div>

      <!-- Error -->
      <div
        v-else-if="errorMessage"
        class="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
      >
        {{ errorMessage }}
      </div>

      <!-- Dashboard content -->
      <template v-else>
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <CompanyStatCard
            title="Active offers"
            :value="stats.offers"
            :icon="BriefcaseBusiness"
            icon-wrapper-class="bg-[#2a2a2d]"
          />
          <CompanyStatCard
            title="Total Applications"
            :value="stats.totalApplications"
            :icon="FileText"
            icon-wrapper-class="bg-[#2a2a2d]"
          />
          <CompanyStatCard
            title="Accepted Candidates"
            :value="stats.accepted"
            :icon="UserCheck"
            icon-wrapper-class="bg-[#2a2a2d]"
          />
          <CompanyStatCard
            title="Pending Applications"
            :value="stats.pending"
            :icon="Clock3"
            icon-wrapper-class="bg-[#2a2a2d]"
          />
        </div>

        <!-- Recent applications -->
        <RecentApplicationsTable :applications="recentApplications" />

        <!-- Accepted candidates / validated conventions -->
        <AcceptedCandidatesPanel
          :candidates="acceptedCandidates"
          @download-convention="handleDownloadConvention"
        />
      </template>
    </section>
  </CompanyLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import CompanyStatCard from '@/components/company/companyStatCard.vue'
import RecentApplicationsTable from '@/components/company/RecentApplicationsTable.vue'
import AcceptedCandidatesPanel from '@/components/company/AcceptedCandidatesPanel.vue'

import {
  BriefcaseBusiness,
  FileText,
  UserCheck,
  Clock3,
} from 'lucide-vue-next'

import {
  getCompanyProfile,
  getCompanyOffers,
  getOfferApplications,
  getCompanyConventions,
  downloadCompanyConventionPdf,
} from '@/services/company'

// state
const loading = ref(true)
const errorMessage = ref('')
const companyName = ref('Company')

const stats = ref({
  offers: 0,
  totalApplications: 0,
  pending: 0,
  accepted: 0,
})

const recentApplications = ref([])
const acceptedCandidates = ref([])

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const getSafeCompanyName = (profileRes) => {
  const storedUser = getStoredUser()

  return (
    storedUser?.company_profile?.company_name ||
    storedUser?.company_name ||
    storedUser?.name ||
    storedUser?.full_name ||
    profileRes?.company_profile?.company_name ||
    profileRes?.company_name ||
    profileRes?.name ||
    profileRes?.full_name ||
    profileRes?.user?.company_profile?.company_name ||
    profileRes?.user?.company_name ||
    profileRes?.user?.name ||
    profileRes?.data?.company_profile?.company_name ||
    profileRes?.data?.company_name ||
    profileRes?.data?.name ||
    profileRes?.data?.user?.company_profile?.company_name ||
    profileRes?.data?.user?.company_name ||
    profileRes?.data?.user?.name ||
    'Company'
  )
}

const getSafeStudentName = (app) => {
  return (
    app?.student?.student_profile?.full_name ||
    app?.student?.full_name ||
    app?.student?.name ||
    app?.student_profile?.full_name ||
    app?.user?.student_profile?.full_name ||
    app?.user?.full_name ||
    app?.user?.name ||
    app?.application?.student?.student_profile?.full_name ||
    app?.application?.student?.full_name ||
    `Student #${app?.student_id ?? ''}`
  )
}

const getSafeStudentUniversity = (app) => {
  return (
    app?.student?.student_profile?.university ||
    app?.student?.university ||
    app?.student_profile?.university ||
    app?.user?.student_profile?.university ||
    app?.application?.student?.student_profile?.university ||
    '—'
  )
}

const capitalizeStatus = (status) => {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getFilenameFromHeaders = (headers, fallback = 'convention.pdf') => {
  const disposition =
    headers?.['content-disposition'] || headers?.['Content-Disposition']

  if (!disposition) return fallback

  const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/)
  const filename = decodeURIComponent(match?.[1] || match?.[2] || '')

  return filename || fallback
}

const handleDownloadConvention = async (item) => {
  if (!item?.conventionId) {
    alert('Convention ID is missing.')
    return
  }

  try {
    const response = await downloadCompanyConventionPdf(item.conventionId)

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const fileURL = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = fileURL
    link.download = getFilenameFromHeaders(
      response.headers,
      item.conventionNumber
        ? `${item.conventionNumber}.pdf`
        : `convention-${item.conventionId}.pdf`
    )

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(fileURL)
  } catch (error) {
    console.error('Failed to download convention:', error.response?.data || error)
    alert(error.response?.data?.message || 'Failed to download convention.')
  }
}

const loadDashboard = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // 1) company name
    const profileRes = await getCompanyProfile()
    companyName.value = getSafeCompanyName(profileRes)

    // 2) offers
    const offersResponse = await getCompanyOffers()
    const offers = offersResponse?.data || offersResponse || []

    stats.value.offers = offers.filter(
      (offer) => (offer.status || '').toLowerCase() === 'open'
    ).length

    // 3) applications from all offers
    let allApplications = []

    for (const offer of offers) {
      const applicationsResponse = await getOfferApplications(offer.id)
      const applications = applicationsResponse?.data || applicationsResponse || []

      const normalizedApplications = applications.map((app) => ({
        ...app,
        offerTitle: offer.title,
      }))

      allApplications.push(...normalizedApplications)
    }

    stats.value.totalApplications = allApplications.length
    stats.value.pending = allApplications.filter(
      (app) => (app.status || '').toLowerCase() === 'pending'
    ).length
    stats.value.accepted = allApplications.filter((app) => {
      const status = (app.status || '').toLowerCase()
      return status === 'accepted' || status === 'validated'
    }).length

    recentApplications.value = allApplications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map((app) => ({
        id: app.id,
        name: getSafeStudentName(app),
        university: getSafeStudentUniversity(app),
        status: capitalizeStatus(app.status),
      }))

    // 4) conventions for accepted/validated candidates panel
    const conventionsResponse = await getCompanyConventions()
    const conventions = conventionsResponse?.data || conventionsResponse || []

    acceptedCandidates.value = conventions.slice(0, 5).map((convention) => ({
      id: convention.id,
      conventionId: convention.id,
      conventionNumber: convention.convention_number || '',
      name:
        convention?.application?.student?.student_profile?.full_name ||
        convention?.application?.student?.full_name ||
        convention?.application?.student?.name ||
        `Student #${convention?.application?.student_id ?? ''}`,
      offer: convention?.application?.offer?.title || 'Internship Offer',
      status: 'Validated by Admin',
    }))
  } catch (error) {
    console.error('Company dashboard error:', error.response?.data || error)
    errorMessage.value = 'Failed to load dashboard data.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>
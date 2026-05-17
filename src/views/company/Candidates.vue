<template>
  <CompanyLayout>
    <div class="min-h-screen bg-[#0B0B0B] px-4 md:px-6 py-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-white text-[30px] md:text-[34px] font-semibold mb-2">
          Candidates
        </h1>
        <p class="text-[#C6C6C6] text-[16px]">
          Track and manage student applications.
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="errorMessage"
        class="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
      >
        {{ errorMessage }}
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <select
          v-model="selectedOffer"
          class="bg-[#2A2A2A] text-[#D1D1D1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#3B82F6] min-w-[235px]"
          @change="handleOfferChange"
        >
          <option value="">All Internship offers</option>
          <option
            v-for="offer in offerOptions"
            :key="offer.id"
            :value="String(offer.id)"
          >
            {{ offer.title }}
          </option>
        </select>

        <select
          v-model="selectedStatus"
          class="bg-[#2A2A2A] text-[#D1D1D1] rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#3B82F6] min-w-[190px]"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Refused">Refused</option>
        </select>
      </div>

      <!-- Table container -->
      <div class="rounded-[26px] bg-[#1E1E1E] p-4 md:p-6">
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-16 text-center"
        >
          <div>
            <h3 class="text-white text-xl font-semibold mb-2">Loading candidates...</h3>
            <p class="text-[#BDBDBD]">
              Please wait while we fetch the applications.
            </p>
          </div>
        </div>

        <template v-else>
          <div class="overflow-x-auto" v-if="filteredCandidates.length > 0">
            <table class="w-full border-separate border-spacing-0">
              <thead>
                <tr class="bg-[#2A2A2A]">
                  <th class="text-left text-white font-semibold px-4 py-4 rounded-tl-xl">
                    Student
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4">
                    University
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4">
                    Skills
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4">
                    Applied For
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4">
                    Applied On
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4">
                    Status
                  </th>
                  <th class="text-left text-white font-semibold px-4 py-4 rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                <CandidateRow
                  v-for="candidate in filteredCandidates"
                  :key="candidate.id"
                  :candidate="candidate"
                  @view-cv="handleViewCV"
                  @accept="handleAccept"
                  @refuse="handleRefuse"
                />
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="flex items-center justify-center py-16 text-center"
          >
            <div>
              <h3 class="text-white text-xl font-semibold mb-2">No candidates found</h3>
              <p class="text-[#BDBDBD]">
                Try changing the selected filters.
              </p>
            </div>
          </div>
        </template>
      </div>

      <StudentCvModal
        :is-open="isCvModalOpen"
        :cv="selectedCv"
        :candidate-name="selectedCandidateName"
        @close="closeCvModal"
      />
    </div>
  </CompanyLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import CandidateRow from '@/components/company/CandidateRow.vue'
import StudentCvModal from '@/components/company/StudentCvModal.vue'
import {
  acceptApplication,
  getCompanyOffers,
  getOfferApplications,
  getPublicStudentProfile,
  refuseApplication,
} from '@/services/company'

const route = useRoute()
const router = useRouter()

const selectedOffer = ref('')
const selectedStatus = ref('')
const candidates = ref([])
const offerOptions = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const isCvModalOpen = ref(false)
const selectedCv = ref(null)
const selectedCandidateName = ref('')

const formatStatus = (status) => {
  if (!status) return 'Pending'

  const normalized = String(status).toLowerCase()

  if (normalized === 'pending') return 'Pending'
  if (normalized === 'accepted') return 'Accepted'
  if (normalized === 'refused') return 'Refused'

  return status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return dateString

  return date.toLocaleDateString('en-CA')
}

const getProfileRoot = (profileResponse) => {
  return profileResponse?.profile || profileResponse?.data?.profile || profileResponse?.data || profileResponse || {}
}

const getStudentName = (profileResponse) => {
  const profile = getProfileRoot(profileResponse)

  return (
    profile?.full_name ||
    profile?.user?.name ||
    profile?.user?.full_name ||
    'Unknown Student'
  )
}

const getStudentUniversity = (profileResponse) => {
  const profile = getProfileRoot(profileResponse)

  return profile?.university || '-'
}

const getStudentSkills = (profileResponse) => {
  const profile = getProfileRoot(profileResponse)

  return Array.isArray(profile?.skills) ? profile.skills : []
}

const normalizeCandidate = (application, studentProfileResponse, offerTitle) => {
  return {
    id: application.id,
    applicationId: application.id,
    student_id: application.student_id,
    offer_id: application.offer_id,
    name: getStudentName(studentProfileResponse),
    university: getStudentUniversity(studentProfileResponse),
    skills: getStudentSkills(studentProfileResponse),
    appliedFor: offerTitle || `Offer #${application.offer_id || '-'}`,
    appliedOn: formatDate(application.created_at),
    status: formatStatus(application.status),
    coverLetter: application.cover_letter || '',
    adminNote: application.admin_note || '',
    rawApplication: application,
    studentProfileResponse,
  }
}

const filteredCandidates = computed(() => {
  return candidates.value.filter((candidate) => {
    const matchesOffer =
      !selectedOffer.value || String(candidate.offer_id) === String(selectedOffer.value)

    const matchesStatus =
      !selectedStatus.value || candidate.status === selectedStatus.value

    return matchesOffer && matchesStatus
  })
})

const fetchOffers = async () => {
  const response = await getCompanyOffers()
  const rawOffers = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : []

  offerOptions.value = rawOffers.map((offer) => ({
    id: offer.id,
    title: offer.title || `Offer #${offer.id}`,
  }))

  const routeOfferId = route.query.offerId || route.params.id || route.params.offerId

  if (routeOfferId) {
    selectedOffer.value = String(routeOfferId)
  } else {
    selectedOffer.value = ''
  }
}

const fetchCandidates = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const allCandidates = []

    for (const offer of offerOptions.value) {
      try {
        const response = await getOfferApplications(offer.id)
        const rawApplications = Array.isArray(response?.data) ? response.data : []

        const enrichedCandidates = await Promise.all(
          rawApplications.map(async (application) => {
            try {
              const studentProfileResponse = await getPublicStudentProfile(application.student_id)

              return normalizeCandidate(
                application,
                studentProfileResponse,
                offer.title
              )
            } catch (error) {
              console.error(
                `Failed to load public profile for student ${application.student_id}:`,
                error.response?.data || error
              )

              return normalizeCandidate(application, null, offer.title)
            }
          })
        )

        allCandidates.push(...enrichedCandidates)
      } catch (error) {
        console.error(
          `Failed to fetch applications for offer ${offer.id}:`,
          error.response?.data || error
        )
      }
    }

    candidates.value = allCandidates
  } catch (error) {
    console.error('Failed to fetch candidates:', error.response?.data || error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to load candidates. Please try again.'
    candidates.value = []
  } finally {
    isLoading.value = false
  }
}

const handleOfferChange = async () => {
  router.replace({
    query: {
      ...route.query,
      offerId: selectedOffer.value || undefined,
    },
  })
}

const handleViewCV = async (candidate) => {
  try {
    let profileResponse = candidate.studentProfileResponse

    if (!profileResponse) {
      profileResponse = await getPublicStudentProfile(candidate.student_id)
    }

    selectedCv.value = getProfileRoot(profileResponse)
    selectedCandidateName.value = candidate.name || getStudentName(profileResponse)
    isCvModalOpen.value = true
  } catch (error) {
    console.error('Failed to load CV:', error.response?.data || error)
    errorMessage.value = error.response?.data?.message || 'Failed to load student CV.'
  }
}

const closeCvModal = () => {
  isCvModalOpen.value = false
  selectedCv.value = null
  selectedCandidateName.value = ''
}

const handleAccept = async (candidate) => {
  if (candidate.status !== 'Pending') return

  try {
    const response = await acceptApplication(candidate.applicationId)
    const updatedStatus = formatStatus(response?.application?.status || 'accepted')

    const target = candidates.value.find(
      (item) => item.applicationId === candidate.applicationId
    )

    if (target) {
      target.status = updatedStatus
    }
  } catch (error) {
    console.error('Failed to accept application:', error.response?.data || error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to accept application.'
  }
}

const handleRefuse = async (candidate) => {
  if (candidate.status !== 'Pending') return

  try {
    const response = await refuseApplication(candidate.applicationId)
    const updatedStatus = formatStatus(response?.application?.status || 'refused')

    const target = candidates.value.find(
      (item) => item.applicationId === candidate.applicationId
    )

    if (target) {
      target.status = updatedStatus
    }
  } catch (error) {
    console.error('Failed to refuse application:', error.response?.data || error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to refuse application.'
  }
}

onMounted(async () => {
  try {
    await fetchOffers()
    await fetchCandidates()
  } catch (error) {
    console.error('Failed to initialize candidates page:', error.response?.data || error)
    errorMessage.value =
      error.response?.data?.message || 'Failed to initialize candidates page.'
  }
})
</script>
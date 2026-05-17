<template>
  <CompanyLayout>
    <div class="min-h-screen bg-[#0B0B0B] px-4 md:px-6 py-6">
      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-white text-[30px] md:text-[34px] font-semibold mb-2">
            Manage Internship Offers
          </h1>
          <p class="text-[#C6C6C6] text-[16px]">
            Create, edit, and manage your internship postings.
          </p>
        </div>

        <button
          type="button"
          class="self-start rounded-xl bg-[#3B82F6] px-6 py-3 text-white text-[16px] font-medium hover:bg-[#2563EB] transition disabled:opacity-60 disabled:cursor-not-allowed"
          @click="handleCreateOffer"
          :disabled="isCreating"
        >
          {{ isCreating ? 'Creating...' : '+ Create New Offer' }}
        </button>
      </div>

      <!-- Error state -->
      <div
        v-if="errorMessage"
        class="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300"
      >
        {{ errorMessage }}
      </div>

      <!-- Offers container -->
      <div class="rounded-[26px] bg-[#1E1E1E] p-4 md:p-6">
        <!-- Loading -->
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-16 text-center"
        >
          <div>
            <h3 class="text-white text-xl font-semibold mb-2">Loading offers...</h3>
            <p class="text-[#BDBDBD]">
              Please wait while we fetch your internship offers.
            </p>
          </div>
        </div>

        <!-- Offers list -->
        <template v-else>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OfferCard
              v-for="offer in filteredOffers"
              :key="offer.id"
              :offer="offer"
              @edit="handleEdit"
              @delete="handleDelete"
              @view-candidates="handleViewCandidates"
            />
          </div>

          <div
            v-if="filteredOffers.length === 0"
            class="flex items-center justify-center py-16 text-center"
          >
            <div>
              <h3 class="text-white text-xl font-semibold mb-2">No offers found</h3>
              <p class="text-[#BDBDBD]">
                Try changing your search or create a new internship offer.
              </p>
            </div>
          </div>
        </template>
      </div>

      <CreateOfferModal
        :isOpen="isModalOpen"
        :mode="modalMode"
        :offer="selectedOffer"
        @close="isModalOpen = false"
        @submit="submitOffer"
      />
    </div>
  </CompanyLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import OfferCard from '@/components/company/offerCard.vue'
import CreateOfferModal from '@/components/company/CreateOfferModal.vue'

import {
  getCompanyOffers,
  createCompanyOffer,
  updateCompanyOffer,
  deleteCompanyOffer,
  getOfferApplications,
} from '@/services/company'

const router = useRouter()

const offers = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const errorMessage = ref('')

const isModalOpen = ref(false)
const modalMode = ref('create')
const selectedOffer = ref(null)

const formatDate = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-CA')
}

const normalizeOffer = (offer, applicantsCount = 0) => {
  return {
    ...offer,
    skills: Array.isArray(offer.required_skills) ? offer.required_skills : [],
    applicants: applicantsCount,
    deadline: formatDate(offer.deadline),
    internship_starts_at: formatDate(offer.internship_starts_at),
  }
}

const fetchOffers = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await getCompanyOffers()

    const rawOffers = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : []

    const offersWithApplicants = await Promise.all(
      rawOffers.map(async (offer) => {
        try {
          const applicationsRes = await getOfferApplications(offer.id)

          const applicantsCount =
            typeof applicationsRes?.total === 'number'
              ? applicationsRes.total
              : Array.isArray(applicationsRes?.data)
              ? applicationsRes.data.length
              : 0

          return normalizeOffer(offer, applicantsCount)
        } catch (error) {
          console.error(
            `Failed to fetch applications count for offer ${offer.id}:`,
            error.response?.data || error
          )

          return normalizeOffer(offer, 0)
        }
      })
    )

    offers.value = offersWithApplicants
  } catch (error) {
    console.error('Failed to fetch offers:', error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message || 'Failed to load offers.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOffers)

const handleCreateOffer = () => {
  modalMode.value = 'create'
  selectedOffer.value = null
  isModalOpen.value = true
}

const handleEdit = (offer) => {
  modalMode.value = 'edit'
  selectedOffer.value = offer
  isModalOpen.value = true
}

const submitOffer = async (formData) => {
  errorMessage.value = ''

  const payload = {
    ...formData,
    required_skills: formData.required_skills,
    internship_starts_at: formData.internship_starts_at || null,
  }

  try {
    if (modalMode.value === 'create') {
      isCreating.value = true
      await createCompanyOffer(payload)
    } else {
      await updateCompanyOffer(selectedOffer.value.id, payload)
    }

    isModalOpen.value = false
    selectedOffer.value = null

    await fetchOffers()
  } catch (error) {
    console.error('Offer submit error:', error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message || 'Failed to save the offer.'
  } finally {
    isCreating.value = false
  }
}

const handleDelete = async (offer) => {
  if (!confirm('Delete this offer?')) return

  errorMessage.value = ''

  try {
    await deleteCompanyOffer(offer.id)

    offers.value = offers.value.filter((o) => o.id !== offer.id)
  } catch (error) {
    console.error('Delete offer error:', error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message || 'Failed to delete the offer.'
  }
}

const handleViewCandidates = (offer) => {
  router.push({
    name: 'company-candidates',
    query: {
      offerId: String(offer.id),
    },
  })
}

const filteredOffers = computed(() => offers.value)
</script>
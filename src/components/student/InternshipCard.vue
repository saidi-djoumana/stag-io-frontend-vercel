<template>
  <div
    class="bg-[#17171b] border border-white/5 rounded-2xl p-5 shadow-md hover:shadow-lg transition"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="min-w-0 w-full">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="
              status === 'open'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            "
          >
            {{ statusLabel }}
          </span>

          <span
            class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-[#70a1ff] border border-blue-500/20"
          >
            {{ typeLabel }}
          </span>
        </div>

        <h3 class="text-[19px] font-semibold text-white leading-snug">
          {{ title }}
        </h3>

        <p class="text-gray-400 text-[15px] mt-1">
          {{ company || 'Company not available' }}
        </p>

        <div class="flex items-center gap-2 text-gray-400 text-sm mt-1">
          <MapPin class="w-4 h-4" />
          <span>{{ location }}</span>
        </div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <div
        class="flex items-center gap-3 bg-[#202026] border border-white/5 rounded-xl px-4 py-3"
      >
        <Briefcase class="w-5 h-5 text-[#70a1ff] shrink-0" />
        <div>
          <p class="text-gray-500 text-xs">Domain</p>
          <p class="text-gray-200 text-sm font-medium">
            {{ domain || 'Not specified' }}
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-[#202026] border border-white/5 rounded-xl px-4 py-3"
      >
        <Clock class="w-5 h-5 text-[#70a1ff] shrink-0" />
        <div>
          <p class="text-gray-500 text-xs">Duration</p>
          <p class="text-gray-200 text-sm font-medium">
            {{ durationText }}
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-[#202026] border border-white/5 rounded-xl px-4 py-3"
      >
        <CalendarDays class="w-5 h-5 text-[#70a1ff] shrink-0" />
        <div>
          <p class="text-gray-500 text-xs">Start date</p>
          <p class="text-gray-200 text-sm font-medium">
            {{ formattedStartDate }}
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-3 bg-[#202026] border border-white/5 rounded-xl px-4 py-3"
      >
        <CalendarX class="w-5 h-5 text-[#70a1ff] shrink-0" />
        <div>
          <p class="text-gray-500 text-xs">Deadline</p>
          <p
            class="text-sm font-medium"
            :class="isDeadlinePassed ? 'text-red-400' : 'text-gray-200'"
          >
            {{ formattedDeadline }}
          </p>
        </div>
      </div>
    </div>

    <!-- Skills -->
    <div v-if="tags.length" class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="tag in tags"
        :key="tag"
        class="px-4 py-1 rounded-full border border-[#1846D0] text-[#70a1ff] text-sm bg-[#1846D0]/10"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Description -->
    <p class="text-gray-400 text-sm leading-relaxed mb-5">
      {{ shortDescription }}
    </p>

    <!-- Buttons -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        @click="openAiMatchModal"
        class="w-full font-semibold px-8 py-2.5 rounded-lg transition bg-[#202026] hover:bg-[#2a2a33] text-[#70a1ff] border border-[#1846D0]"
      >
        AI Match
      </button>

      <button
        @click="$emit('apply')"
        :disabled="loading || alreadyApplied || status !== 'open' || isDeadlinePassed"
        class="w-full font-semibold px-8 py-2.5 rounded-lg transition"
        :class="buttonClass"
      >
        {{ buttonText }}
      </button>
    </div>

    <!-- AI Match Modal -->
    <div
      v-if="showAiModal"
      class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
    >
      <div
        class="bg-[#17171b] border border-white/10 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl"
      >
        <button
          @click="closeAiMatchModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X class="w-5 h-5" />
        </button>

        <h2 class="text-white text-2xl font-bold mb-1">
          AI Match Result
        </h2>

        <p class="text-gray-400 text-sm mb-6">
          This result compares your profile with this internship offer.
        </p>

        <!-- Loading -->
        <div v-if="aiLoading" class="py-10 text-center">
          <Loader2 class="w-8 h-8 animate-spin text-[#70a1ff] mx-auto mb-3" />
          <p class="text-gray-300">Analyzing your match...</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="aiError"
          class="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4"
        >
          {{ aiError }}
        </div>

        <!-- Result -->
        <div v-else-if="aiResult" class="space-y-5">
          <!-- Percentage -->
          <div class="bg-[#202026] border border-white/5 rounded-xl p-5">
            <p class="text-gray-400 text-sm mb-2">Your match percentage</p>

            <div class="flex items-center gap-4">
              <div class="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#3b82f6] rounded-full transition-all"
                  :style="{ width: `${aiResult.percentage || 0}%` }"
                ></div>
              </div>

              <span class="text-white text-2xl font-bold">
                {{ aiResult.percentage }}%
              </span>
            </div>
          </div>

          <!-- Matched Skills -->
          <div>
            <h3 class="text-white font-semibold mb-2">Matched skills</h3>

            <div v-if="aiResult.matched_skills?.length" class="flex flex-wrap gap-2">
              <span
                v-for="skill in aiResult.matched_skills"
                :key="skill"
                class="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-sm"
              >
                {{ skill }}
              </span>
            </div>

            <p v-else class="text-gray-400 text-sm">
              No matched skills found.
            </p>
          </div>

          <!-- Missing Skills -->
          <div>
            <h3 class="text-white font-semibold mb-2">Missing skills</h3>

            <div v-if="aiResult.missing_skills?.length" class="flex flex-wrap gap-2">
              <span
                v-for="skill in aiResult.missing_skills"
                :key="skill"
                class="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm"
              >
                {{ skill }}
              </span>
            </div>

            <p v-else class="text-gray-400 text-sm">
              You do not seem to be missing any required skill.
            </p>
          </div>

          <!-- Explanation -->
          <div class="bg-[#202026] border border-white/5 rounded-xl p-5">
            <h3 class="text-white font-semibold mb-2">Explanation</h3>
            <p class="text-gray-300 text-sm leading-relaxed">
              {{ aiResult.explanation }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getAiMatch } from '@/services/student'
import {
  MapPin,
  Briefcase,
  Clock,
  CalendarDays,
  CalendarX,
  X,
  Loader2
} from 'lucide-vue-next'

const props = defineProps({
  id: [String, Number],
  title: String,
  company: String,
  location: String,
  domain: String,
  type: String,
  durationUnit: String,
  durationValue: [String, Number],
  deadline: String,
  internshipStartsAt: String,
  status: {
    type: String,
    default: 'open'
  },
  tags: {
    type: Array,
    default: () => []
  },
  description: String,
  loading: {
    type: Boolean,
    default: false
  },
  alreadyApplied: {
    type: Boolean,
    default: false
  }
})

defineEmits(['apply'])

const showAiModal = ref(false)
const aiLoading = ref(false)
const aiError = ref('')
const aiResult = ref(null)

async function openAiMatchModal() {
  showAiModal.value = true
  aiError.value = ''
  aiResult.value = null
  aiLoading.value = true

  try {
    if (!props.id) {
      throw new Error('Offer ID is missing.')
    }

    const data = await getAiMatch(props.id)

    console.log('AI MATCH RESPONSE:', data)

    const result = data.data ? data.data : data
    if (result.success === false) {
  throw new Error(result.message || 'AI matching failed. Please try again.')
}

    aiResult.value = {
      percentage: result.percentage ?? 0,
      matched_skills: result.matched_skills ?? [],
      missing_skills: result.missing_skills ?? [],
      explanation:
        result.explanation ||
        'We could not generate a detailed explanation for this match. Please try again.'
    }
  } catch (error) {
    console.error(error)

    aiError.value =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong while analyzing your match.'
  } finally {
    aiLoading.value = false
  }
}

function closeAiMatchModal() {
  showAiModal.value = false
}

const statusLabel = computed(() =>
  props.status === 'open' ? 'Open' : 'Closed'
)

const typeLabel = computed(() => {
  const map = {
    présentiel: 'On-site',
    télétravail: 'Remote',
    hybride: 'Hybrid'
  }

  return map[props.type] || props.type || 'Not specified'
})

const durationText = computed(() => {
  if (!props.durationValue || !props.durationUnit) return 'Not specified'

  const value = Number(props.durationValue)

  if (props.durationUnit === 'weeks') {
    return `${value} ${value === 1 ? 'week' : 'weeks'}`
  }

  return `${value} ${value === 1 ? 'month' : 'months'}`
})

function formatDate(date) {
  if (!date) return 'Not specified'

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formattedDeadline = computed(() => formatDate(props.deadline))

const formattedStartDate = computed(() =>
  formatDate(props.internshipStartsAt)
)

const isDeadlinePassed = computed(() => {
  if (!props.deadline) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = new Date(props.deadline)
  deadline.setHours(0, 0, 0, 0)

  return deadline < today
})

const shortDescription = computed(() => {
  if (!props.description) return 'No description provided.'

  return props.description.length > 160
    ? props.description.slice(0, 160) + '...'
    : props.description
})

const buttonText = computed(() => {
  if (props.alreadyApplied) return 'Already Applied'
  if (props.loading) return 'Applying...'
  if (props.status !== 'open') return 'Offer Closed'
  if (isDeadlinePassed.value) return 'Deadline Passed'
  return 'Apply'
})

const buttonClass = computed(() => {
  if (
    props.alreadyApplied ||
    props.status !== 'open' ||
    isDeadlinePassed.value
  ) {
    return 'bg-gray-600 text-gray-300 cursor-not-allowed'
  }

  if (props.loading) {
    return 'bg-[#2563eb]/70 text-white cursor-wait'
  }

  return 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
})
</script>
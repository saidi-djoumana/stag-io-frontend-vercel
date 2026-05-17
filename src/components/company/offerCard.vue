<template>
  <div
    class="bg-[#171717] rounded-[22px] p-6 border border-transparent hover:border-[#2E8BFF] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
  >
    <!-- Title -->
    <h3 class="text-white text-[28px] font-semibold leading-tight mb-3">
      {{ offer.title }}
    </h3>

    <!-- Description -->
    <p class="text-[#CFCFCF] text-[15px] leading-7 mb-4 max-w-[90%]">
      {{ offer.description }}
    </p>

    <!-- Info -->
    <div class="space-y-3 mb-4">
      <div class="flex items-center gap-2 text-[#D9D9D9] text-[15px]">
        <MapPin :size="18" class="text-white/90" />
        <span>{{ offer.location }}</span>
      </div>

      <div v-if="offer.domain" class="text-[#D9D9D9] text-[15px]">
        <span class="text-white font-medium">Domain:</span>
        {{ offer.domain }}
      </div>

      <div
        v-if="offer.duration_value && offer.duration_unit"
        class="text-[#D9D9D9] text-[15px]"
      >
        <span class="text-white font-medium">Duration:</span>
        {{ offer.duration_value }} {{ offer.duration_unit }}
      </div>

      <div
        v-if="offer.internship_starts_at"
        class="text-[#D9D9D9] text-[15px]"
      >
        <span class="text-white font-medium">Start Date:</span>
        {{ offer.internship_starts_at }}
      </div>

      <div
        v-if="offer.deadline"
        class="text-[15px]"
        :class="isDeadlinePassed ? 'text-red-400' : 'text-[#D9D9D9]'"
      >
        <span class="text-white font-medium">Deadline:</span>
        {{ offer.deadline }}

        <span
          v-if="isDeadlinePassed"
          class="ml-2 text-red-400 text-sm"
        >
          (Expired)
        </span>
      </div>
    </div>

    <!-- Badges -->
    <div class="flex flex-wrap gap-3 mb-4">
      <span
        class="inline-flex items-center rounded-full bg-[#3B82F6] px-5 py-1.5 text-[13px] text-white"
      >
        {{ offer.type }}
      </span>

      <span
        v-if="offer.status"
        class="inline-flex items-center rounded-full px-5 py-1.5 text-[13px] text-white"
        :class="
          offer.status === 'open'
            ? 'bg-[#22C55E]'
            : 'bg-[#EF4444]'
        "
      >
        {{ offer.status }}
      </span>
    </div>

    <!-- Skills -->
    <div v-if="offer.skills?.length" class="flex flex-wrap gap-3 mb-4">
      <span
        v-for="skill in offer.skills"
        :key="skill"
        class="inline-flex items-center rounded-full bg-[#3B82F6] px-5 py-1.5 text-[13px] text-white"
      >
        {{ skill }}
      </span>
    </div>

    <!-- Applicants -->
    <div class="mb-6">
      <span
        class="inline-flex items-center rounded-full bg-[#22C55E] px-5 py-1.5 text-[13px] text-white"
      >
        {{ offer.applicants ?? 0 }} Applicants
      </span>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="min-w-[110px] rounded-xl border border-[#2E8BFF] px-6 py-3 text-[#2E8BFF] text-[16px] font-medium hover:bg-[#2E8BFF] hover:text-white transition"
        @click="$emit('edit', offer)"
      >
        Edit
      </button>

      <button
        type="button"
        class="min-w-[130px] rounded-xl border border-[#EF4444] px-6 py-3 text-[#EF4444] text-[16px] font-medium hover:bg-[#EF4444] hover:text-white transition"
        @click="$emit('delete', offer)"
      >
        Delete
      </button>

      <button
        type="button"
        class="min-w-[180px] rounded-xl bg-[#3B82F6] px-6 py-3 text-white text-[16px] font-medium hover:bg-[#2563EB] transition"
        @click="$emit('view-candidates', offer)"
      >
        View Candidates
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MapPin } from 'lucide-vue-next'

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete', 'view-candidates'])

const isDeadlinePassed = computed(() => {
  if (!props.offer?.deadline) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = new Date(props.offer.deadline)
  deadline.setHours(0, 0, 0, 0)

  return deadline < today
})
</script>
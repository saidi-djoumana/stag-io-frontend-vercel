<template>
  <tr class="border-b border-white/5 last:border-b-0">
    <!-- Student -->
    <td class="px-4 py-5 align-top">
      <div class="flex items-center gap-3 min-w-[150px]">
        <div
          class="w-11 h-11 rounded-full bg-[#D9D9D9] flex items-center justify-center text-[12px] text-gray-700 font-semibold shrink-0"
        >
          {{ initials }}
        </div>

        <div class="text-white text-[15px] leading-6">
          <p>{{ candidate.name }}</p>
        </div>
      </div>
    </td>

    <!-- University -->
    <td class="px-4 py-5 text-[#D1D1D1] text-[15px] align-top min-w-[100px]">
      {{ candidate.university }}
    </td>

    <!-- Skills -->
    <td class="px-4 py-5 align-top min-w-[100px]">
      <div v-if="candidate.skills?.length" class="flex flex-wrap gap-2">
        <span
          v-for="skill in candidate.skills"
          :key="skill"
          class="inline-flex items-center rounded-full bg-[#3B82F6] px-3 py-1 text-[12px] text-white"
        >
          {{ skill }}
        </span>
      </div>
      <span v-else class="text-[#8D8D8D] text-[14px]">No skills</span>
    </td>

    <!-- Applied For -->
    <td class="px-4 py-5 text-[#D1D1D1] text-[15px] align-top min-w-[170px] leading-7">
      {{ candidate.appliedFor }}
    </td>

    <!-- Applied On -->
    <td class="px-4 py-5 text-[#D1D1D1] text-[15px] align-top min-w-[95px] leading-7">
      {{ candidate.appliedOn }}
    </td>

    <!-- Status -->
    <td class="px-4 py-5 align-top min-w-[100px]">
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-[12px] text-white"
        :class="statusClass"
      >
        {{ candidate.status }}
      </span>
    </td>

    <!-- Actions -->
    <td class="px-4 py-5 align-top min-w-[180px]">
      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="rounded-lg border border-[#3B82F6] px-4 py-2 text-[#3B82F6] text-[14px] hover:bg-[#3B82F6] hover:text-white transition"
          @click="$emit('view-cv', candidate)"
        >
          View CV
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-md bg-[#22C55E] px-4 py-2 text-white text-[14px] hover:bg-[#16A34A] transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="candidate.status !== 'Pending'"
            @click="$emit('accept', candidate)"
          >
            Accept
          </button>

          <button
            type="button"
            class="rounded-md bg-[#EF4444] px-4 py-2 text-white text-[14px] hover:bg-[#DC2626] transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="candidate.status !== 'Pending'"
            @click="$emit('refuse', candidate)"
          >
            Refuse
          </button>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  candidate: {
    type: Object,
    required: true,
  },
})

defineEmits(['view-cv', 'accept', 'refuse'])

const statusClass = computed(() => {
  if (props.candidate.status === 'Pending') return 'bg-[#EAB308]'
  if (props.candidate.status === 'Accepted') return 'bg-[#22C55E]'
  if (props.candidate.status === 'Refused') return 'bg-[#EF4444]'
  return 'bg-gray-500'
})

const initials = computed(() => {
  const name = props.candidate.name || ''
  const parts = name.trim().split(' ').filter(Boolean)

  if (parts.length === 0) return 'ST'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})
</script>
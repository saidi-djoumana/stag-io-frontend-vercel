<template>
  <span
    class="inline-flex items-center justify-center min-w-[105px] px-4 py-1.5 rounded-full text-sm font-medium"
    :class="badgeClass"
  >
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const badgeClass = computed(() => {
  const current = props.status.toLowerCase()

  if (current === 'accepted') return 'bg-[#22c55e] text-white'
  if (current === 'pending') return 'bg-[#facc15] text-white'
  if (current === 'rejected') return 'bg-[#ef4444] text-white'
  if (current === 'validated') return 'bg-[#22c55e] text-white'

  return 'bg-gray-500 text-white'
})
</script>

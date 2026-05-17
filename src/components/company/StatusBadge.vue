<template>
  <span
    class="inline-flex items-center justify-center min-w-[124px] h-[30px] rounded-full px-4 text-[14px] font-medium"
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
  const value = props.status.toLowerCase()

  if (value.includes('pending')) {
    return 'bg-[#f4bf0a] text-white'
  }

  if (value.includes('accepted')) {
    return 'bg-[#22c55e] text-white'
  }

  if (value.includes('refused')) {
    return 'bg-[#ff4b4b] text-white'
  }

  if (value.includes('validated')) {
    return 'bg-[#1db954] text-white'
  }

  return 'bg-gray-500 text-white'
})
</script>
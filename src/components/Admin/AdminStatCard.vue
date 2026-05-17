<template>
  <div
    class="bg-[#1E1E1E] rounded-[16px] px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.20)] min-h-[110px]"
  >
    <h3 class="text-white text-[20px] font-semibold mb-4">
      {{ title }}
    </h3>

    <div
      class="inline-flex items-center rounded-md border border-[#A56A16] px-4 py-1.5 text-[#D9A441] text-[14px] font-medium"
    >
      {{ displayValue }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number, null],
    required: false,
    default: null,
  },
})

const displayValue = computed(() => {
  if (props.value === null) return '—'
  return props.value
})
</script>
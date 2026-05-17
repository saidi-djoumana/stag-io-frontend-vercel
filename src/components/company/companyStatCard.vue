<template>
  <div class="bg-[#1b1b1f] rounded-2xl p-5 min-h-[120px] flex flex-col justify-between">
    <div>
      <p class="text-white text-[18px] font-semibold">{{ title }}</p>
    </div>

    <div class="mt-4">
      <span
        class="inline-flex items-center justify-center min-w-[62px] h-[26px] px-3 rounded-md border border-[#b07b25] text-[#d8a03a] text-[13px]"
      >
        {{ value }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
})
</script>
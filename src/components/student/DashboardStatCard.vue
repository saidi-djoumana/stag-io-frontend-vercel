<template>
  <div class="bg-[#17171b] rounded-2xl p-5 shadow-md">
    <h3 class="text-[18px] font-semibold text-white mb-4">{{ title }}</h3>

    <div
      class="inline-flex items-center justify-center min-w-[54px] h-[24px] px-3 rounded border border-[#b7862f] text-[#d7a44c] text-sm"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
})
</script>

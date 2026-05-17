<template>
  <div class="relative w-full">
    <select
      v-model="model"
      class="w-full h-[42px] bg-[#2A2A2D] rounded-[8px] px-4 pr-10 text-[16px] text-[#D6D6D6] outline-none border border-transparent focus:border-[#3B82F6] appearance-none transition"
    >
      <option disabled value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>

    <span
      class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#B8B8B8] text-[12px]"
    >
      ▼
    </span>
  </div>
</template>

<script setup>
const model = defineModel()

defineProps({
  placeholder: {
    type: String,
    default: 'Select',
  },
  options: {
    type: Array,
    default: () => [],
  },
})
</script>
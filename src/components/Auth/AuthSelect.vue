<script setup>
defineProps({
  label: String,
  modelValue: String,
  options: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full">
    <label class="mb-3 block text-[18px] font-normal text-[#4A4A4A]">
      {{ label }}
    </label>

    <div class="relative">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="h-[54px] w-full appearance-none rounded-[10px] border-0 bg-[#EEEEEE] px-4 text-[16px] text-[#8D8D8D] outline-none focus:ring-2 focus:ring-[#1846D0]/20"
      >
        <option disabled value="">Student/Company</option>
        <option v-for="option in options" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8D8D8D]">
        ▼
      </div>
    </div>
  </div>
</template>

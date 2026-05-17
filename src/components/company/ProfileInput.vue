<template>
  <input
    :type="type"
    :placeholder="placeholder"
    v-model="model"
    class="w-full h-[42px] bg-[#2A2A2D] rounded-[8px] px-4 text-[16px] text-white placeholder:text-[#A7A7A7] outline-none border border-transparent focus:border-[#3B82F6] transition"
  />
</template>

<script setup>
const model = defineModel()

defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
})
</script>
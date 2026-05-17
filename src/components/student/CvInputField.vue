<template>
  <div>
    <label class="block text-[15px] text-[#bfc4d6] mb-3 font-medium">
      {{ label }}
    </label>

    <input
      v-if="type !== 'textarea'"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full h-[54px] rounded-xl bg-[#232325] border border-transparent px-4 text-white placeholder:text-gray-500 outline-none focus:border-[#1846D0] transition"
    />

    <textarea
      v-else
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      rows="4"
      class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-4 text-white placeholder:text-gray-500 outline-none resize-none focus:border-[#1846D0] transition"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
})

defineEmits(['update:modelValue'])
</script>

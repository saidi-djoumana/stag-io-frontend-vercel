<script setup>
import { computed } from 'vue'
import { Mail, Lock } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const iconComponent = computed(() => {
  if (props.icon === 'mail') return Mail
  if (props.icon === 'lock') return Lock
  return null
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-3 block text-[16px] font-medium text-[#4A4A4A]">
      {{ label }}
    </label>

    <div class="flex items-center overflow-hidden rounded-[10px] bg-[#EEEEEE]">
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        class="h-[54px] w-full bg-transparent px-5 text-[16px] text-[#4A4A4A] outline-none placeholder:text-[#7A7A7A]"
        @input="emit('update:modelValue', $event.target.value)"
      />

      <div
        v-if="iconComponent"
        class="mr-0.5 flex h-[54px] w-[54px] items-center justify-center rounded-[10px] bg-[#27348B] text-white"
      >
        <component :is="iconComponent" :size="22" stroke-width="2" />
      </div>
    </div>
  </div>
</template>

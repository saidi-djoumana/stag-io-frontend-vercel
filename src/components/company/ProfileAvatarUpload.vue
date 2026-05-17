<template>
  <div class="flex flex-col items-center">
    <div class="relative w-[122px] h-[122px]">
      <img
        :src="previewImage"
        alt="Company logo"
        class="w-full h-full rounded-full object-cover border-[5px] border-white"
      />

      <button
        type="button"
        class="absolute bottom-[2px] right-[-2px] w-[24px] h-[24px] rounded-full bg-[#3B82F6] border-2 border-white flex items-center justify-center text-[11px] text-white"
        @click="openFilePicker"
      >
        ✎
      </button>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <p class="mt-4 text-[18px] font-medium text-[#D9D9D9]">
      Upload company logo
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:image'])

const fileInput = ref(null)

const previewImage = computed(() => props.imageSrc)

const openFilePicker = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    emit('update:image', reader.result)
  }

  reader.readAsDataURL(file)
}
</script>
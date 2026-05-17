<template>
  <tr class="border-t border-black/40">
    <!-- Student Name -->
    <td class="px-4 py-6 text-white text-[15px] align-middle whitespace-nowrap">
      {{ item.studentName }}
    </td>

    <!-- Company Name -->
    <td class="px-4 py-6 text-white text-[15px] align-middle whitespace-nowrap">
      {{ item.companyName }}
    </td>

    <!-- Internship Title -->
    <td class="px-4 py-6 text-white text-[15px] align-middle max-w-[180px]">
      <span class="leading-6">{{ item.internshipTitle }}</span>
    </td>

    <!-- Duration -->
    <td class="px-4 py-6 text-white text-[15px] align-middle whitespace-nowrap">
      {{ item.duration }}
    </td>

    <!-- Validation Date -->
    <td class="px-4 py-6 text-white text-[15px] align-middle whitespace-nowrap">
      {{ item.validationDate }}
    </td>

    <!-- Agreement Status -->
    <td class="px-4 py-6 align-middle">
      <span
        class="inline-flex items-center rounded-full px-4 py-2 text-[14px] leading-none"
        :class="statusClass"
      >
        {{ item.status }}
      </span>
    </td>

    <!-- Actions -->
    <td class="px-4 py-6 align-middle">
      <div class="flex flex-col gap-3 min-w-[180px]">
        <button
          type="button"
          class="rounded-lg bg-[#3B82F6] px-4 py-2.5 text-white text-[14px] hover:bg-[#2563EB] transition"
          @click="$emit('regenerate', item)"
        >
          Regenerate PDF
        </button>

        <button
          type="button"
          class="rounded-lg border border-[#3B82F6] px-4 py-2.5 text-[#3B82F6] text-[14px] hover:bg-[#3B82F6] hover:text-white transition"
          @click="$emit('download', item)"
        >
          Download PDF
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(['regenerate', 'download'])

const statusClass = computed(() => {
  if (props.item.status === 'Generated') {
    return 'bg-[#22C55E] text-black'
  }
  if (props.item.status === 'Pending') {
    return 'bg-[#FACC15] text-black'
  }
  return 'bg-gray-500 text-white'
})
</script>
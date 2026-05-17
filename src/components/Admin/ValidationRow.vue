<template>
  <tr class="border-t border-black/40">
    <td class="px-4 py-5 align-middle">
      <div class="flex items-center gap-3 min-w-[140px]">
        <div
          class="w-10 h-10 rounded-full bg-[#D9D9D9] flex items-center justify-center text-[8px] text-gray-500 shrink-0"
        >
          40×40
        </div>
        <span class="text-white text-[15px] leading-6">{{ item.student }}</span>
      </div>
    </td>

    <td class="px-4 py-5 text-white text-[15px] align-middle">
      {{ item.studentId }}
    </td>

    <td class="px-4 py-5 text-white text-[15px] align-middle">
      {{ item.department }}
    </td>

    <td class="px-4 py-5 text-white text-[15px] align-middle">
      {{ item.company }}
    </td>

    <td class="px-4 py-5 text-white text-[15px] align-middle max-w-[180px]">
      <span class="leading-6">{{ item.title }}</span>
    </td>

    <td class="px-4 py-5 text-white text-[15px] align-middle whitespace-nowrap">
      {{ item.duration }}
    </td>

    <td class="px-4 py-5 align-middle">
      <span
        class="inline-flex items-center rounded-full px-4 py-2 text-[14px] leading-none"
        :class="statusClass"
      >
        {{ item.status }}
      </span>
    </td>

    <td class="px-4 py-5 align-middle">
      <div class="flex flex-col gap-2 min-w-[180px]">
        <button
          type="button"
          class="rounded-lg border border-[#2E8BFF] px-4 py-2 text-[#2E8BFF] text-[14px] hover:bg-[#2E8BFF] hover:text-white transition"
          @click="$emit('view-details', item)"
        >
          View Details
        </button>

        <div v-if="item.rawStatus === 'selected'" class="flex gap-2">
          <button
            type="button"
            class="rounded-md bg-[#22C55E] px-4 py-2 text-white text-[14px] hover:bg-[#16A34A] transition"
            @click="$emit('approve', item)"
          >
            Approve
          </button>

          <button
            type="button"
            class="rounded-md bg-[#EF4444] px-4 py-2 text-white text-[14px] hover:bg-[#DC2626] transition"
            @click="$emit('reject', item)"
          >
            Reject
          </button>
        </div>
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

defineEmits(['view-details', 'approve', 'reject'])

const statusClass = computed(() => {
  if (props.item.rawStatus === 'selected') {
    return 'bg-[#FACC15] text-black'
  }

  if (props.item.rawStatus === 'validated') {
    return 'bg-[#22C55E] text-white'
  }

  if (props.item.rawStatus === 'rejected') {
    return 'bg-[#EF4444] text-white'
  }

  if (props.item.rawStatus === 'accepted') {
    return 'bg-blue-500 text-white'
  }

  if (props.item.rawStatus === 'refused') {
    return 'bg-red-500 text-white'
  }

  if (props.item.rawStatus === 'pending') {
    return 'bg-gray-500 text-white'
  }

  return 'bg-gray-500 text-white'
})
</script>
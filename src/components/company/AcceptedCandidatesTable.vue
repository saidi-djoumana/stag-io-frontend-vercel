<template>
  <div class="bg-[#1b1b1f] rounded-2xl p-5">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-white text-lg font-semibold">Accepted candidates</h3>
      <button class="text-sm text-[#1846D0] hover:underline">See all</button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-separate border-spacing-y-3">
        <thead>
          <tr class="text-left text-gray-400 text-sm">
            <th class="font-medium pb-1">Candidate Name</th>
            <th class="font-medium pb-1">Internship Offer</th>
            <th class="font-medium pb-1">Status</th>
            <th class="font-medium pb-1">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in candidates"
            :key="item.id"
            class="bg-[#232328]"
          >
            <td class="px-4 py-4 rounded-l-xl text-white">{{ item.name }}</td>
            <td class="px-4 py-4 text-gray-300">{{ item.offer }}</td>
            <td class="px-4 py-4">
              <StatusBadge :status="item.status" />
            </td>
            <td class="px-4 py-4 rounded-r-xl">
              <button
                class="bg-[#1846D0] hover:bg-[#1239aa] transition-colors text-white text-sm font-medium px-4 py-2 rounded-xl"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from '@/components/company/StatusBadge.vue'

defineProps({
  candidates: {
    type: Array,
    default: () => [],
  },
})
</script>
<template>
  <div class="bg-[#1b1b1f] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
    <h3 class="text-white text-[20px] font-medium mb-6">Recent Applications</h3>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[700px]">
        <thead>
          <tr class="bg-[#2a2a2d] text-left text-[#d9d9d9]">
            <th class="px-6 py-4 text-[18px] font-semibold rounded-l-md">Student Name</th>
            <th class="px-6 py-4 text-[18px] font-semibold">University</th>
            <th class="px-6 py-4 text-[18px] font-semibold rounded-r-md">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in applications" :key="item.id">
            <td class="px-6 py-5 text-white text-[18px]">{{ item.name }}</td>
            <td class="px-6 py-5 text-white text-[18px]">{{ item.university }}</td>
            <td class="px-6 py-5">
              <StatusBadge :status="item.status" />
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
  applications: {
    type: Array,
    default: () => [],
  },
})
</script>
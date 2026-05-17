<template>
  <div class="bg-[#17171b] rounded-2xl p-6 shadow-md">
    <h2 class="text-[20px] font-semibold mb-6">My Applications</h2>

    <div class="overflow-x-auto">
      <table class="w-full border-separate border-spacing-y-4">
        <thead>
          <tr class="text-left text-white">
            <th class="font-semibold px-4">Internship</th>
            <th class="font-semibold px-4">Company</th>
            <th class="font-semibold px-4">Applied On</th>
            <th class="font-semibold px-4">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="app in applications" :key="app.id" class="text-gray-200">
            <td class="px-4 py-1">{{ app.internship }}</td>
            <td class="px-4 py-1">{{ app.company }}</td>
            <td class="px-4 py-1">{{ app.appliedOn }}</td>
            <td class="px-4 py-1">
              <StatusBadge :status="app.status" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  applications: {
    type: Array,
    default: () => [],
  },
})
</script>

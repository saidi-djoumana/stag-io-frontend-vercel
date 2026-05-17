<template>
  <div class="bg-[#1b1b1f] rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
    <h3 class="text-white text-[20px] font-medium mb-10">Accepted Candidates</h3>

    <div class="bg-[#18253a] rounded-2xl px-8 py-10">
      <!-- Header -->
      <div
        v-if="candidates.length > 0"
        class="grid grid-cols-[1.1fr_1.8fr_1fr_1.4fr] gap-6 text-[#9ca3af] uppercase text-[14px] tracking-wide mb-5 px-8"
      >
        <p>Candidate Name</p>
        <p>Internship Offer</p>
        <p>Status</p>
        <p>Action</p>
      </div>

      <!-- Rows -->
      <div v-if="candidates.length > 0" class="space-y-4">
        <div
          v-for="item in candidates"
          :key="item.id"
          class="grid grid-cols-[1.1fr_1.8fr_1fr_1.4fr] gap-6 items-center bg-[#3b475b] px-8 py-6 rounded-xl"
        >
          <p class="text-white text-[16px]">{{ item.name }}</p>
          <p class="text-white text-[16px]">{{ item.offer }}</p>

          <div>
            <StatusBadge :status="item.status" />
          </div>

          <div>
            <button
              type="button"
              class="w-full bg-[#3165e7] hover:bg-[#2556d1] transition rounded-xl py-3 px-4 text-white text-[15px] font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="!item.conventionId"
              @click="$emit('download-convention', item)"
            >
              <FileDown class="w-4 h-4" />
              Download Convention
            </button>
          </div>
        </div>
      </div>

      <!-- Empty message -->
      <p
        v-else
        class="text-center text-[#b5b8c2] text-[18px]"
      >
        No accepted candidates available at the moment.
      </p>
    </div>
  </div>
</template>

<script setup>
import { FileDown } from 'lucide-vue-next'
import StatusBadge from '@/components/company/StatusBadge.vue'

defineProps({
  candidates: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['download-convention'])
</script>
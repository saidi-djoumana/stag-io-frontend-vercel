<template>
  <AdminLayout>
    <div class="min-h-screen">
      <div class="mb-4">
        <h1 class="text-white text-[42px] font-semibold leading-tight">
          Administration Dashboard
        </h1>
      </div>

      <div v-if="loading" class="text-gray-400 text-[15px] mb-6">
        Loading dashboard...
      </div>

      <div
        v-else-if="error"
        class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300"
      >
        {{ error }}
      </div>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <AdminStatCard title="Total Applications" :value="stats.total_applications" />
          <AdminStatCard title="Selected Internships" :value="stats.selected" />
          <AdminStatCard title="Students Placed" :value="stats.students_placed" />
          <AdminStatCard title="Open Offers" :value="stats.open_offers" />
        </div>

        <div
          class="bg-[#1E1E1E] rounded-[18px] p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.20)] mb-8"
        >
          <h2 class="text-white text-[18px] font-semibold mb-4">
            Validated vs Selected Applications
          </h2>

          <div
            class="bg-[#3E4B61] rounded-[12px] px-6 py-6 min-h-[320px] flex flex-col items-center justify-center"
          >
            <div class="relative w-[210px] h-[210px] mb-8">
              <div
                class="w-full h-full rounded-full"
                :style="{ background: validationChartBackground }"
              ></div>

              <div
                class="absolute inset-[26px] rounded-full bg-[#3E4B61] border-[3px] border-white flex flex-col items-center justify-center text-center"
              >
                <span class="text-white text-[38px] font-bold leading-none">
                  {{ validationRate }}%
                </span>
                <span class="text-white text-[15px] mt-2">Validation Rate</span>
              </div>
            </div>

            <div class="flex items-center gap-8 self-start flex-wrap">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 bg-[#22C55E] rounded-sm"></span>
                <span class="text-black/80 text-[16px] font-medium">
                  Validated ({{ stats.validated }})
                </span>
              </div>

              <div class="flex items-center gap-2">
                <span class="w-4 h-4 bg-[#FF4B4B] rounded-sm"></span>
                <span class="text-black/80 text-[16px] font-medium">
                  Selected / Waiting ({{ stats.selected }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-[#1E1E1E] rounded-[18px] p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.20)]"
        >
          <h2 class="text-white text-[18px] font-semibold mb-4">
            Applications Status Overview
          </h2>

          <div
            class="bg-[#3E4B61] rounded-[12px] px-6 py-8 min-h-[300px] flex items-end"
          >
            <div class="w-full">
              <div class="relative h-[180px] w-full border-l border-b border-white/30 ml-8 mb-3">
                <div class="absolute left-0 right-0 top-[20%] border-t border-white/25"></div>
                <div class="absolute left-0 right-0 top-[40%] border-t border-white/25"></div>
                <div class="absolute left-0 right-0 top-[60%] border-t border-white/25"></div>
                <div class="absolute left-0 right-0 top-[80%] border-t border-white/25"></div>

                <div class="absolute inset-0 flex items-end justify-around px-6 pb-0">
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.pending) }"></div>
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.accepted) }"></div>
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.selected) }"></div>
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.validated) }"></div>
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.refused) }"></div>
                  <div class="w-[12%] bg-[#1E4ED8]" :style="{ height: getBarHeight(stats.rejected) }"></div>
                </div>
              </div>

              <div class="ml-8 flex justify-around text-[11px] text-white/50">
                <span>Pending</span>
                <span>Accepted</span>
                <span>Selected</span>
                <span>Validated</span>
                <span>Refused</span>
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminStatCard from '@/components/Admin/AdminStatCard.vue'
import { getAdminStats } from '@/services/admin'

const loading = ref(true)
const error = ref('')

const stats = ref({
  total_applications: 0,
  pending: 0,
  accepted: 0,
  refused: 0,
  validated: 0,
  rejected: 0,
  selected: 0,
  total_offers: 0,
  open_offers: 0,
  students_placed: 0
})

const validationRate = computed(() => {
  const total = stats.value.selected + stats.value.validated
  if (!total) return 0

  return Math.round((stats.value.validated / total) * 100)
})

const validationChartBackground = computed(() => {
  const greenDeg = (validationRate.value / 100) * 360
  return `conic-gradient(#22C55E 0deg ${greenDeg}deg, #FF3B3B ${greenDeg}deg 360deg)`
})

const maxBarValue = computed(() => {
  return Math.max(
    stats.value.pending,
    stats.value.accepted,
    stats.value.selected,
    stats.value.validated,
    stats.value.refused,
    stats.value.rejected,
    1
  )
})

const getBarHeight = (value) => {
  const minHeight = 12
  const maxHeight = 78
  const percent = (value / maxBarValue.value) * maxHeight

  return `${Math.max(percent, value > 0 ? minHeight : 0)}%`
}

const fetchAdminStats = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await getAdminStats()

    stats.value = {
      total_applications: data.total_applications ?? 0,
      pending: data.pending ?? 0,
      accepted: data.accepted ?? 0,
      refused: data.refused ?? 0,
      validated: data.validated ?? 0,
      rejected: data.rejected ?? 0,
      selected: data.selected ?? 0,
      total_offers: data.total_offers ?? 0,
      open_offers: data.open_offers ?? 0,
      students_placed: data.students_placed ?? 0
    }

    console.log('Admin stats:', stats.value)
  } catch (err) {
    console.error('Failed to fetch admin stats:', err.response?.data || err)
    error.value = 'Failed to load dashboard statistics.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAdminStats()
})
</script>
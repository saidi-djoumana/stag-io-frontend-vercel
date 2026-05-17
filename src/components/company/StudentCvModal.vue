<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#17171b] border border-white/10 shadow-2xl"
      >
        <div class="sticky top-0 z-10 bg-[#17171b] border-b border-white/10 px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-white text-[24px] md:text-[30px] font-semibold leading-tight">
              {{ displayName }}
            </h2>
            <p class="text-[#BDBDBD] text-[15px] mt-1">
              Student CV Preview
            </p>
          </div>

          <button
            type="button"
            class="shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white text-[20px] hover:bg-white/10 transition"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>

        <div class="p-6 md:p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoCard label="Full Name" :value="displayName" />
            <InfoCard label="Email" :value="cv?.email || '-'" />
            <InfoCard label="Phone" :value="cv?.phone || '-'" />
            <InfoCard label="Wilaya" :value="cv?.wilaya || '-'" />
            <InfoCard label="University" :value="cv?.university || '-'" />
            <InfoCard label="Field of Study" :value="cv?.field_of_study || '-'" />
            <InfoCard label="Academic Level" :value="cv?.academic_level || '-'" />
            <InfoCard label="Portfolio Link" :value="cv?.portfolio_link || '-'" />
          </div>

          <div class="rounded-2xl bg-[#1E1E1E] border border-white/5 p-5">
            <h3 class="text-white text-[18px] font-semibold mb-4">Skills</h3>

            <div v-if="displaySkills.length" class="flex flex-wrap gap-3">
              <span
                v-for="skill in displaySkills"
                :key="skill"
                class="inline-flex items-center rounded-full bg-[#3B82F6] px-4 py-2 text-[14px] text-white"
              >
                {{ skill }}
              </span>
            </div>

            <p v-else class="text-[#A1A1AA] text-[15px]">
              No skills available.
            </p>
          </div>

          <div class="rounded-2xl bg-[#1E1E1E] border border-white/5 p-5">
            <h3 class="text-white text-[18px] font-semibold mb-4">Experience</h3>

            <p
              v-if="displayExperience"
              class="text-[#E5E7EB] text-[15px] leading-7 whitespace-pre-line"
            >
              {{ displayExperience }}
            </p>

            <p v-else class="text-[#A1A1AA] text-[15px]">
              No experience available.
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  cv: {
    type: Object,
    default: null,
  },
  candidateName: {
    type: String,
    default: '',
  },
})

defineEmits(['close'])

const displayName = computed(() => {
  return (
    props.cv?.full_name ||
    props.cv?.user?.name ||
    props.cv?.user?.full_name ||
    props.candidateName ||
    'Unknown Student'
  )
})

const displaySkills = computed(() => {
  return Array.isArray(props.cv?.skills) ? props.cv.skills : []
})

const displayExperience = computed(() => {
  return (
    props.cv?.previous_internship_experiences ||
    props.cv?.experience ||
    props.cv?.experiences ||
    props.cv?.professional_experience ||
    ''
  )
})

const InfoCard = defineComponent({
  name: 'InfoCard',
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(localProps) {
    return () =>
      h('div', { class: 'rounded-2xl bg-[#1E1E1E] border border-white/5 p-5' }, [
        h('p', { class: 'text-[#A1A1AA] text-[13px] mb-2' }, localProps.label),
        h('p', { class: 'text-white text-[16px] break-words' }, localProps.value || '-'),
      ])
  },
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
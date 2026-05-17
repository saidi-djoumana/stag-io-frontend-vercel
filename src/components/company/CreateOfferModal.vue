<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6"
      @click.self="closeModal"
    >
      <div
        class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#151515] border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.06)] p-5 md:p-7"
      >
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 class="text-white text-2xl font-semibold">
              {{ mode === 'edit' ? 'Edit Offer' : 'Create New Offer' }}
            </h2>

            <p class="text-[#BDBDBD] text-[15px] mt-1">
              Fill in the internship offer details below.
            </p>
          </div>

          <button
            type="button"
            class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white text-xl transition flex items-center justify-center"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <div
          v-if="isPeriodLocked"
          class="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-yellow-300 text-sm"
        >
          This offer already has accepted, selected, or validated candidates. You can still edit the offer details, but you cannot change the internship start date or duration.
        </div>

        <form class="space-y-5" @submit.prevent="submitForm">
          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Title
            </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. Frontend Developer Intern"
              class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#1846D0] transition"
            />
          </div>

          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Description
            </label>

            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Describe the internship offer..."
              class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white placeholder:text-gray-500 outline-none resize-none focus:border-[#1846D0] transition"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-white text-[15px] font-medium mb-2">
                Domain
              </label>

              <input
                v-model="form.domain"
                type="text"
                placeholder="e.g. Web Development"
                class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#1846D0] transition"
              />
            </div>

            <div>
              <label class="block text-white text-[15px] font-medium mb-2">
                Location
              </label>

              <input
                v-model="form.location"
                type="text"
                placeholder="e.g. Algiers"
                class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-[#1846D0] transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Type
            </label>

            <select
              v-model="form.type"
              class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white outline-none focus:border-[#1846D0] transition"
            >
              <option value="présentiel">Présentiel</option>
              <option value="hybride">Hybride</option>
              <option value="télétravail">Télétravail</option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-white text-[15px] font-medium mb-2">
                Duration Value
              </label>

              <input
                v-model.number="form.duration_value"
                type="number"
                min="1"
                placeholder="e.g. 3"
                :disabled="isPeriodLocked"
                :class="lockedInputClass"
              />
            </div>

            <div>
              <label class="block text-white text-[15px] font-medium mb-2">
                Duration Unit
              </label>

              <select
                v-model="form.duration_unit"
                :disabled="isPeriodLocked"
                :class="lockedInputClass"
              >
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Internship Start Date
            </label>

            <input
              v-model="form.internship_starts_at"
              type="date"
              :disabled="isPeriodLocked"
              :class="lockedInputClass"
            />
          </div>

          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Required Skills
            </label>

            <div
              class="min-h-[56px] rounded-xl bg-[#232325] border border-transparent px-4 py-3 focus-within:border-[#1846D0] transition"
            >
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-for="(skill, index) in form.required_skills"
                  :key="`${skill}-${index}`"
                  class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1846D0] text-white text-[14px]"
                >
                  {{ skill }}

                  <button
                    type="button"
                    class="text-white/80 hover:text-white"
                    @click="removeSkill(index)"
                  >
                    ×
                  </button>
                </span>

                <input
                  v-model="newSkill"
                  type="text"
                  placeholder="Type a skill and press Enter"
                  class="flex-1 min-w-[180px] bg-transparent text-white placeholder:text-gray-500 outline-none py-1"
                  @keydown.enter.prevent="addSkill"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-white text-[15px] font-medium mb-2">
              Deadline
            </label>

            <input
              v-model="form.deadline"
              type="date"
              class="w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white outline-none focus:border-[#1846D0] transition"
            />
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white hover:bg-white/10 transition"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-xl bg-[#1846D0] px-5 py-3 text-white font-medium hover:bg-[#1238aa] transition"
            >
              {{ mode === 'edit' ? 'Update Offer' : 'Create Offer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  mode: {
    type: String,
    default: 'create',
  },
  offer: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'submit'])

const getInitialForm = () => ({
  title: '',
  description: '',
  domain: '',
  location: '',
  type: 'présentiel',
  duration_unit: 'weeks',
  duration_value: 1,
  required_skills: [],
  deadline: '',
  internship_starts_at: '',
})

const form = reactive(getInitialForm())
const newSkill = ref('')

const isPeriodLocked = computed(() => {
  if (props.mode !== 'edit' || !props.offer) return false

  return Number(props.offer.applicants ?? 0) > 0
})

const lockedInputClass = computed(() => {
  const base =
    'w-full rounded-xl bg-[#232325] border border-transparent px-4 py-3 text-white outline-none focus:border-[#1846D0] transition'

  return isPeriodLocked.value
    ? `${base} opacity-60 cursor-not-allowed`
    : base
})

const resetForm = () => {
  Object.assign(form, getInitialForm())
  newSkill.value = ''
}

const fillForm = (offer) => {
  Object.assign(form, {
    title: offer.title || '',
    description: offer.description || '',
    domain: offer.domain || '',
    location: offer.location || '',
    type: offer.type || 'présentiel',
    duration_unit: offer.duration_unit || 'weeks',
    duration_value: offer.duration_value || 1,
    required_skills: offer.required_skills || offer.skills || [],
    deadline: offer.deadline || '',
    internship_starts_at: offer.internship_starts_at || '',
  })
}

watch(
  () => [props.offer, props.mode, props.isOpen],
  () => {
    if (props.offer && props.mode === 'edit') {
      fillForm(props.offer)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('close')
}

const addSkill = () => {
  const value = newSkill.value.trim()

  if (!value) return
  if (form.required_skills.includes(value)) return

  form.required_skills.push(value)
  newSkill.value = ''
}

const removeSkill = (index) => {
  form.required_skills.splice(index, 1)
}

const submitForm = () => {
  const payload = {
    title: form.title,
    description: form.description,
    domain: form.domain,
    location: form.location,
    type: form.type,
    required_skills: [...form.required_skills],
    deadline: form.deadline || null,
  }

  if (!isPeriodLocked.value) {
    payload.duration_unit = form.duration_unit
    payload.duration_value = form.duration_value
    payload.internship_starts_at = form.internship_starts_at || null
  }

  emit('submit', payload)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
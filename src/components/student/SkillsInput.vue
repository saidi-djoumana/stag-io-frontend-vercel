<template>
  <div>
    <label class="block text-[15px] text-[#bfc4d6] mb-3 font-medium">
      {{ label }}
    </label>

    <!-- Selected skills + input -->
    <div
      class="min-h-[56px] rounded-xl bg-[#232325] border border-transparent px-4 py-3 focus-within:border-[#1846D0] transition"
    >
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-for="(skill, index) in skills"
          :key="`${skill}-${index}`"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1846D0] text-white text-[14px]"
        >
          {{ skill }}
          <button
            type="button"
            @click="removeSkill(index)"
            class="text-white/80 hover:text-white transition"
          >
            ×
          </button>
        </span>

        <input
          v-model="newSkill"
          type="text"
          placeholder="Add a skill..."
          @keydown.enter.prevent="addSkill"
          @keydown.tab="addSkill"
          @keydown="handleCommaKey"
          @blur="addSkill"
          class="flex-1 min-w-[180px] bg-transparent text-white placeholder:text-gray-500 outline-none"
        />
      </div>
    </div>

    <!-- Suggested skills -->
    <div class="flex flex-wrap gap-3 mt-4">
      <button
        v-for="suggestedSkill in availableSuggestions"
        :key="suggestedSkill"
        type="button"
        @click="selectSuggestedSkill(suggestedSkill)"
        class="h-[42px] px-4 rounded-lg bg-[#3b82f6] text-white text-[15px] hover:opacity-90 transition"
      >
        {{ suggestedSkill }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Technical Skills',
  },
  modelValue: {
    type: [Array, String],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const newSkill = ref('')
const skills = ref([])

const suggestedSkills = [
  'HTML',
  'CSS',
  'JavaScript',
  'Vue.js',
  'Laravel',
  'PHP',
  'MySQL',
  'Git',
  'GitHub',
  'Tailwind CSS',
  'Bootstrap',
  'REST API',
]

const normalizeSkills = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((skill) => String(skill).trim())
      .filter((skill) => skill.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
  }

  return []
}

watch(
  () => props.modelValue,
  (newValue) => {
    skills.value = normalizeSkills(newValue)
  },
  { immediate: true, deep: true }
)

const updateParent = () => {
  emit('update:modelValue', [...skills.value])
}

const skillExists = (skillToCheck) => {
  return skills.value.some(
    (skill) => skill.toLowerCase() === skillToCheck.toLowerCase()
  )
}

const addSingleSkill = (skill) => {
  const cleanedSkill = skill.trim()

  if (!cleanedSkill) return
  if (skillExists(cleanedSkill)) return

  skills.value.push(cleanedSkill)
}

const addSkill = () => {
  const trimmedValue = newSkill.value.trim()

  if (!trimmedValue) {
    newSkill.value = ''
    return
  }

  const parsedSkills = trimmedValue
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  parsedSkills.forEach((skill) => {
    addSingleSkill(skill)
  })

  updateParent()
  newSkill.value = ''
}

const handleCommaKey = (event) => {
  if (event.key === ',') {
    event.preventDefault()
    addSkill()
  }
}

const removeSkill = (index) => {
  skills.value.splice(index, 1)
  updateParent()
}

const selectSuggestedSkill = (skill) => {
  if (skillExists(skill)) return

  skills.value.push(skill)
  updateParent()
}

const availableSuggestions = computed(() => {
  return suggestedSkills.filter((suggestedSkill) => !skillExists(suggestedSkill))
})
</script>
<template>
  <AdminLayout>
    <div class="min-h-screen">
      <div class="mb-8">
        <h1 class="mb-2 text-[30px] font-semibold text-white md:text-[34px]">
          Account Approvals
        </h1>
        <p class="text-[16px] text-[#C6C6C6]">
          Review newly registered students and companies before they can access the platform.
        </p>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div class="rounded-[22px] bg-[#1E1E1E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p class="mb-2 text-sm text-[#A1A1AA]">Pending Students</p>
          <h2 class="text-3xl font-semibold text-white">{{ students.length }}</h2>
        </div>

        <div class="rounded-[22px] bg-[#1E1E1E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p class="mb-2 text-sm text-[#A1A1AA]">Pending Companies</p>
          <h2 class="text-3xl font-semibold text-white">{{ companies.length }}</h2>
        </div>

        <div class="rounded-[22px] bg-[#1E1E1E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
          <p class="mb-2 text-sm text-[#A1A1AA]">Total Pending</p>
          <h2 class="text-3xl font-semibold text-white">{{ totalPending }}</h2>
        </div>
      </div>

      <div class="mb-6 rounded-[22px] bg-[#1E1E1E] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.20)]">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex gap-3">
            <button
              @click="activeTab = 'students'"
              :class="activeTab === 'students' ? activeClass : inactiveClass"
            >
              Students
            </button>

            <button
              @click="activeTab = 'companies'"
              :class="activeTab === 'companies' ? activeClass : inactiveClass"
            >
              Companies
            </button>
          </div>

          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
            class="w-full rounded-xl border border-white/10 bg-[#2A2A2A] px-4 py-3 text-white outline-none transition placeholder:text-[#8C8C8C] focus:border-[#1846D0] md:max-w-[480px]"
          />
        </div>
      </div>

      <div
        v-if="error"
        class="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-300"
      >
        {{ error }}
      </div>

      <div
        v-if="loading"
        class="rounded-[22px] bg-[#1E1E1E] p-10 text-center text-[#C6C6C6]"
      >
        Loading pending accounts...
      </div>

      <div
        v-else
        class="rounded-[22px] bg-[#1E1E1E] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.20)]"
      >
        <div class="mb-5">
          <h2 class="text-[22px] font-semibold text-white">
            {{ activeTab === 'students' ? 'Pending Students' : 'Pending Companies' }}
          </h2>
          <p class="text-sm text-[#A1A1AA]">
            Approve valid accounts or reject suspicious registrations.
          </p>
        </div>

        <div v-if="filteredAccounts.length > 0" class="overflow-x-auto">
          <table class="w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Name
                </th>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Email
                </th>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Role
                </th>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Registered At
                </th>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Status
                </th>
                <th class="px-4 pb-2 text-left text-[15px] font-semibold text-[#D8D8D8]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="account in filteredAccounts"
                :key="account.id"
                class="bg-[#2A2A2A]"
              >
                <td class="rounded-l-2xl px-4 py-4 text-white">
                  <div class="font-medium">
                    {{ getAccountName(account) }}
                  </div>
                </td>

                <td class="px-4 py-4 text-[#D1D5DB]">
                  {{ account.email || 'No email' }}
                </td>

                <td class="px-4 py-4 text-[#D1D5DB] capitalize">
                  {{ account.role }}
                </td>

                <td class="px-4 py-4 text-[#D1D5DB]">
                  {{ formatDate(account.created_at) }}
                </td>

                <td class="px-4 py-4">
                  <span class="rounded-full bg-[#FACC15] px-3 py-1 text-sm font-medium text-black">
                    Pending
                  </span>
                </td>

                <td class="rounded-r-2xl px-4 py-4">
                  <div class="flex flex-wrap gap-3">
                    <button
                      class="rounded-xl bg-[#22C55E] px-4 py-2 text-white transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="actionLoadingId === account.id"
                      @click="handleApprove(account)"
                    >
                      {{ actionLoadingId === account.id ? 'Working...' : 'Approve' }}
                    </button>

                    <button
                      class="rounded-xl bg-[#EF4444] px-4 py-2 text-white transition hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="actionLoadingId === account.id"
                      @click="handleReject(account)"
                    >
                      {{ actionLoadingId === account.id ? 'Working...' : 'Reject' }}
                    </button>

                    <button
                      class="rounded-xl border border-white/10 px-4 py-2 text-white transition hover:bg-white/5"
                      :disabled="actionLoadingId === account.id"
                      @click="openModal(account)"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="py-16 text-center">
          <h3 class="mb-2 text-xl font-semibold text-white">
            No pending {{ activeTab }} found
          </h3>
          <p class="text-[#BDBDBD]">
            {{
              search.trim()
                ? 'Try a different name or email.'
                : `There are currently no ${activeTab} waiting for approval.`
            }}
          </p>
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="showModal && selectedAccount"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          @click.self="closeModal"
        >
          <div class="w-full max-w-2xl rounded-[26px] bg-[#1E1E1E] p-6 shadow-2xl">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 class="mb-1 text-2xl font-semibold text-white">
                  {{ getAccountName(selectedAccount) }}
                </h2>
                <p class="text-[#A1A1AA] capitalize">
                  {{ selectedAccount.role }} account details
                </p>
              </div>

              <button
                class="rounded-xl border border-white/10 px-4 py-2 text-white transition hover:bg-white/5"
                @click="closeModal"
              >
                Close
              </button>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="mb-2 text-sm text-[#A1A1AA]">Name</p>
                <p class="text-white">{{ getAccountName(selectedAccount) }}</p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="mb-2 text-sm text-[#A1A1AA]">Email</p>
                <p class="text-white">{{ selectedAccount.email || 'N/A' }}</p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="mb-2 text-sm text-[#A1A1AA]">Role</p>
                <p class="text-white capitalize">{{ selectedAccount.role }}</p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4">
                <p class="mb-2 text-sm text-[#A1A1AA]">Registered At</p>
                <p class="text-white">{{ formatDate(selectedAccount.created_at) }}</p>
              </div>

              <div class="rounded-2xl bg-[#2A2A2A] p-4 md:col-span-2">
                <p class="mb-2 text-sm text-[#A1A1AA]">Account Status</p>
                <p class="font-medium text-[#FACC15]">Pending Approval</p>
              </div>
            </div>

            <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
              <button
                class="rounded-xl bg-[#22C55E] px-5 py-3 text-white transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="actionLoadingId === selectedAccount.id"
                @click="handleApprove(selectedAccount)"
              >
                {{ actionLoadingId === selectedAccount.id ? 'Working...' : 'Approve' }}
              </button>

              <button
                class="rounded-xl bg-[#EF4444] px-5 py-3 text-white transition hover:bg-[#DC2626] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="actionLoadingId === selectedAccount.id"
                @click="handleReject(selectedAccount)"
              >
                {{ actionLoadingId === selectedAccount.id ? 'Working...' : 'Reject' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import {
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getPendingStudents,
  approveStudent,
  rejectStudent,
} from '@/services/adminCompanies'

const loading = ref(true)
const error = ref('')
const search = ref('')
const companies = ref([])
const students = ref([])
const activeTab = ref('students')
const actionLoadingId = ref(null)

const showModal = ref(false)
const selectedAccount = ref(null)

const activeClass =
  'rounded-xl bg-[#1846D0] px-5 py-3 text-sm font-semibold text-white transition'

const inactiveClass =
  'rounded-xl border border-white/10 bg-[#2A2A2A] px-5 py-3 text-sm font-semibold text-[#D1D5DB] transition hover:bg-white/5'

const totalPending = computed(() => students.value.length + companies.value.length)

const currentAccounts = computed(() => {
  return activeTab.value === 'students' ? students.value : companies.value
})

const getAccountName = (account) => {
  if (account.role === 'student') {
    return (
      account.student_profile?.full_name ||
      account.studentProfile?.full_name ||
      account.name ||
      'Unknown Student'
    )
  }

  return (
    account.company_profile?.company_name ||
    account.companyProfile?.company_name ||
    account.name ||
    'Unknown Company'
  )
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const filteredAccounts = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) return currentAccounts.value

  return currentAccounts.value.filter((account) => {
    const name = getAccountName(account).toLowerCase()
    const email = (account.email || '').toLowerCase()

    return name.includes(term) || email.includes(term)
  })
})

const fetchAccounts = async () => {
  loading.value = true
  error.value = ''

  try {
    const [studentsResponse, companiesResponse] = await Promise.all([
      getPendingStudents(),
      getPendingCompanies(),
    ])

    students.value = studentsResponse.data || []
    companies.value = companiesResponse.data || []
  } catch (err) {
    console.error(err.response?.data || err)
    error.value = err.response?.data?.message || 'Failed to load pending accounts.'
  } finally {
    loading.value = false
  }
}

const removeAccountFromList = (account) => {
  if (account.role === 'student') {
    students.value = students.value.filter((item) => item.id !== account.id)
  } else {
    companies.value = companies.value.filter((item) => item.id !== account.id)
  }
}

const handleApprove = async (account) => {
  actionLoadingId.value = account.id

  try {
    if (account.role === 'student') {
      await approveStudent(account.id)
      alert('Student approved successfully ✅')
    } else {
      await approveCompany(account.id)
      alert('Company approved successfully ✅')
    }

    removeAccountFromList(account)

    if (selectedAccount.value?.id === account.id) {
      closeModal()
    }
  } catch (err) {
    console.error(err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to approve account.')
  } finally {
    actionLoadingId.value = null
  }
}

const handleReject = async (account) => {
  actionLoadingId.value = account.id

  try {
    if (account.role === 'student') {
      await rejectStudent(account.id)
      alert('Student rejected successfully.')
    } else {
      await rejectCompany(account.id)
      alert('Company rejected successfully.')
    }

    removeAccountFromList(account)

    if (selectedAccount.value?.id === account.id) {
      closeModal()
    }
  } catch (err) {
    console.error(err.response?.data || err)
    alert(err.response?.data?.message || 'Failed to reject account.')
  } finally {
    actionLoadingId.value = null
  }
}

const openModal = (account) => {
  selectedAccount.value = account
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedAccount.value = null
}

onMounted(() => {
  fetchAccounts()
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
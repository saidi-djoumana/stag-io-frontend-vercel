<template>
  <div class="bg-[#0b0b0d] min-h-screen text-white">
    <!-- Mobile top bar -->
    <div class="md:hidden sticky top-0 z-30 bg-[#0b0b0d] px-4 py-4 border-b border-white/5">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="isSidebarOpen = true"
          class="flex items-center justify-center w-11 h-11 rounded-xl bg-[#111214] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex justify-center">
          <div class="w-[135px] h-[42px] overflow-hidden flex items-center justify-center">
            <img
              :src="logo"
              alt="Stag.io Logo"
              class="w-[160px] max-w-none object-contain -mt-1"
            />
          </div>
        </div>

        <div class="w-11 h-11" />
      </div>
    </div>

    <StudentSidebar
      :isOpen="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <main class="ml-0 md:ml-[290px] min-h-screen p-4 md:p-6 lg:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StudentSidebar from '@/components/student/StudentSidebar.vue'
import logo from '@/assets/Images/logo.png'

const isSidebarOpen = ref(false)
</script>
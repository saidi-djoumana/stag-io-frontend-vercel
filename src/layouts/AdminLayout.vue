<template>
  <div class="min-h-screen bg-[#111214] flex text-white overflow-hidden">
    <!-- Sidebar -->
    <AdminSidebar class="shrink-0" />

    <!-- Main content -->
    <div class="flex-1 h-screen overflow-y-auto px-7 py-5">
      <div class="flex flex-col gap-5">
        <TopBar />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/Admin/AdminSideBar.vue';
import TopBar from '@/components/common/topBar.vue';
</script>
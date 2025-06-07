<template>
    <div>
        <Header />
        <div class="w-full h-[calc(100vh-65px)] flex items-center overflow-auto">
            <Sidebar />
            <div class="w-[calc(100%-300px)] h-full bg-green-400">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Header from '../components/common/Header.vue';
import Sidebar from '../components/common/Sidebar.vue';
</script>

<style scoped></style>
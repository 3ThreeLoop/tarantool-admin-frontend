<template>
    <div>
        <Header />
        <div class="w-full h-[calc(100vh-65px)] flex items-center overflow-auto">
            <Sidebar />
            <div class="w-[calc(100%-300px)] h-full">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Header from '../components/common/Header.vue';
import Sidebar from '../components/common/Sidebar.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()

onMounted(async () => {
    try {
        console.log('Layout component mounted')
        await userStore.fetchUserInfo()
    } catch (error) {
        console.error('error :', error)
    }
})
</script>

<style scoped></style>
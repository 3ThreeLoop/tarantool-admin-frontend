<template>
  <div
    class="h-[64px] w-full flex justify-between items-center px-10 bg-gradient-to-br from-[#000000] to-[#0f172a] border-b border-[rgba(6,182,212,0.2)]">
    <!-- Left Side - Logo -->
    <div class="left-side">
      <div class="tarantool-logo h-full w-full flex justify-start relative">
        <img src="/public/images/tarantool-logo-color.svg" alt="logo" class="w-[150px] h-full object-contain">
        <span class="absolute right-0 -top-1 uppercase font-bold text-inter text-xs text-[#06b6d4]">admin</span>
      </div>
    </div>

    <!-- Right Side - Language, Profile & Logout -->
    <div class="right-side flex items-center space-x-4">
      <!-- Language Selector -->
      <el-dropdown @command="handleLanguageChange" trigger="click">
        <div
          class="flex items-center space-x-1 cursor-pointer px-3 py-1 rounded-md hover:bg-[rgba(6,182,212,0.1)] transition-colors duration-200">
          <img :src="currentLanguage.flag" alt="flag" class="h-4 w-full rounded-sm">
          <span class="text-sm text-gray-300 font-medium">{{ currentLanguage.label }}</span>
          <el-icon class="text-gray-400 text-xs">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="bg-[#1e293b] border-[rgba(6,182,212,0.2)]">
            <el-dropdown-item v-for="lang in languages" :key="lang.code" :command="lang.code"
              class="text-gray-300 hover:text-[#06b6d4] gap-2"
              :class="{ 'text-[#06b6d4]': currentLanguage.code === lang.code }">
              <img :src="lang.flag" alt="flag" class="h-5 w-full rounded-sm">
              {{ lang.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- User Profile Dropdown -->
      <el-dropdown trigger="click" size="large">
        <div
          class="flex items-center space-x-2 cursor-pointer px-2 py-1 rounded-md hover:bg-[rgba(6,182,212,0.1)] transition-colors duration-200">
          <el-avatar :size="32" :src="userAvatar" class="border border-[rgba(6,182,212,0.3)]">
            <el-icon>
              <User />
            </el-icon>
          </el-avatar>
          <div class="text-left">
            <div class="text-sm font-medium text-white">{{ userName || userInfo.user_name }} ({{
              userStore.userInfo?.user_name
            }})</div>
            <div class="text-xs text-gray-400">{{ userEmail }}</div>
          </div>
          <el-icon class="text-gray-400">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="bg-[#1e293b] border-[rgba(6,182,212,0.2)] profile-dropdown">
            <!-- Profile Info Section -->
            <div class="profile-info p-4">
              <div class="flex items-center space-x-3 mb-3">
                <el-avatar :size="48" :src="userAvatar" class="border border-[rgba(6,182,212,0.3)]">
                  <el-icon>
                    <User />
                  </el-icon>
                </el-avatar>
                <div class="text-left">
                  <div class="text-base font-semibold text-white">{{ userName || userInfo.user_name }} ({{
                    userStore.userInfo?.user_name }})</div>
                  <!-- <div class="text-sm text-gray-400">{{ userRole }}</div> -->
                  <div class="text-xs text-[#06b6d4]">{{ userEmail }}</div>
                </div>
              </div>
              <div class="space-y-1 text-xs text-gray-400">
                <div>Last login: <span class="text-gray-300">{{ lastLogin }}</span></div>
                <div>Status: <span class="text-green-400">Online</span></div>
                <div>Database: <span class="text-[#06b6d4]">{{ currentDatabase }}</span></div>
              </div>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- Logout Button -->
      <el-button @click="showLogoutDialog = true" size="large" color="#dc3545"
        class="logout-btn px-3 py-2 rounded-md bg-transparent border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all duration-200">
        <el-icon class="mr-1">
          <SwitchButton />
        </el-icon>
        Logout
      </el-button>
    </div>
  </div>

  <!-- logout dialog -->
  <el-dialog v-model="showLogoutDialog" :show-close="false" title="Confirm Logout" width="350px" align-center
    class="custom-dialog !bg-[#0A0A12] border !border-[var(--el-border-color)] !rounded-2xl">
    <span class="text-gray-300"> Are you sure you want to logout? You will need to sign in again to access your
      databases.</span>
    <template #header="{ close, titleId, titleClass }">
      <div class="custom-dialog-header flex justify-between border-b pb-3 !border-[var(--el-border-color)]">
        <h3 :id="titleId" :class="titleClass"
          class="custom-dialog-title flex font-semibold !text-[#06b6d4] items-center gap-2">
          <el-icon>
            <WarnTriangleFilled />
          </el-icon>
          Confirm Logout
        </h3>
        <el-button :icon="Close" circle @click="close" plain />
      </div>
    </template>
    <template #footer>
      <span class="dialog-footer flex justify-end gap-2 mt-2">
        <el-button size="large" @click="showLogoutDialog = false" plain>Cancel</el-button>
        <el-button size="large" @click="authStore.logout(), router.push('/login')" color="#dc3545">Logout</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Close,
  User,
  SwitchButton,
  ArrowDown,
  WarnTriangleFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const authStore = useAuthStore()
const showLogoutDialog = ref(false)
const userStore = useUserStore()

// Computed properties for display using store data
const userName = computed(() => {
  const user = userStore.userInfo
  if (!user) return 'Loading...'
  return user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.user_name || 'User'
})

const userEmail = computed(() => userStore.userInfo?.email || '')
const userAvatar = computed(() => {
  const photo = userStore.userInfo?.profile_photo
  return photo ? `/public/images/avatar/${photo}` : ''
})
const currentDatabase = computed(() => {
  const databases = userStore.userInfo?.user_databases
  return databases?.[0]?.db_name || 'No database'
})
const lastLogin = ref('2024-06-17 10:30 AM')

// Language data
const languages = ref([
  { code: 'en', label: 'English', flag: '/public/images/flags/Flag_of_United_States.svg' },
  { code: 'km', label: 'Khmer', flag: '/public/images/flags/Flag_of_Cambodia.svg' },
])
const currentLanguage = ref(languages.value[0])

// Methods
const handleLanguageChange = (langCode) => {
  const selectedLang = languages.value.find(lang => lang.code === langCode)
  if (selectedLang) {
    currentLanguage.value = selectedLang
    // Implement your language change logic here
    console.log('Language changed to:', langCode)
  }
}

// Function to load user info from API
const loadUserInfo = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/user/info')
    const data = await response.json()

    if (data.success) {
      userInfo.value = data.data.user_info
    }
  } catch (error) {
    console.error('Error loading user info:', error)
  }
}

// Load user info on component mount
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
/* Custom dropdown styles */
:deep(.el-dropdown-menu) {
  background-color: #1e293b;
  border: 1px solid rgba(6, 182, 212, 0.2);
  min-width: 280px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(6, 182, 212, 0.1);
}

/* Profile dropdown specific styles */
:deep(.profile-dropdown) {
  padding: 0 !important;
}

:deep(.profile-dropdown .el-dropdown-menu__item) {
  padding: 12px 16px;
}

.profile-info {
  background-color: rgba(6, 182, 212, 0.05);
}

/* Logout button styles */
.logout-btn:deep(.el-button) {
  background-color: transparent !important;
  border: 1px solid #ef4444 !important;
  color: #ef4444 !important;
}

.logout-btn:hover:deep(.el-button) {
  background-color: #ef4444 !important;
  color: white !important;
}

.custom-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(6, 182, 212, 0.2);
}

.custom-dialog :deep(.el-dialog) {
  background-color: #1e293b !important;
  color: white;
}

.custom-dialog :deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;
}
</style>
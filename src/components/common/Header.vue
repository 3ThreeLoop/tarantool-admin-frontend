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

    <!-- Right Side - Language & Profile -->
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
              <!-- <span class="mr-2">{{ lang.flag }}</span> -->
              <img :src="lang.flag" alt="flag" class="h-5 w-full rounded-sm">
              {{ lang.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- User Profile Dropdown -->
      <el-dropdown @command="handleUserCommand" trigger="click" size="large">
        <div
          class="flex items-center space-x-2 cursor-pointer px-2 py-1 rounded-md hover:bg-[rgba(6,182,212,0.1)] transition-colors duration-200">
          <el-avatar :size="32" :src="userAvatar" class="border border-[rgba(6,182,212,0.3)]">
            <el-icon>
              <User />
            </el-icon>
          </el-avatar>
          <div class="text-right">
            <div class="text-sm font-medium text-white">{{ userName }}</div>
            <div class="text-xs text-gray-400">{{ userRole }}</div>
          </div>
          <el-icon class="text-gray-400">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="bg-[#1e293b] border-[rgba(6,182,212,0.2)]">
            <el-dropdown-item command="profile" class="text-gray-300 hover:text-[#06b6d4]">
              <el-icon class="mr-2">
                <User />
              </el-icon>
              Profile
            </el-dropdown-item>
            <el-dropdown-item command="settings" class="text-gray-300 hover:text-[#06b6d4]">
              <el-icon class="mr-2">
                <Setting />
              </el-icon>
              Settings
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" class="text-red-400 hover:text-red-300">
              <el-icon class="mr-2">
                <SwitchButton />
              </el-icon>
              Logout
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// User data
const userName = ref('Admin User')
const userRole = ref('Administrator')
const userAvatar = ref('') // Add avatar URL if available

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

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      // Handle logout logic
      console.log('Logout user')
      break
  }
}
</script>

<style scoped>
/* Custom dropdown styles */
:deep(.el-dropdown-menu) {
  background-color: #1e293b;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(6, 182, 212, 0.1);
}
</style>
<template>
    <div class="relative w-full h-screen">
        <!-- Video Background -->
        <div class="absolute inset-0 z-[1] -left-[10%]">
            <video autoplay loop muted playsinline class="w-full h-full object-cover">
                <source src="/public/videos/background/vk-tarantool_empty.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>

        <!-- Auth Container Positioned Right & Centered Vertically -->
        <div
            class="absolute gap-2 max-w-[450px] min-w-[280px] max-h-[90vh] border-t-none bg-gradient-to-br from-[#000000] to-[#0f172a] border border-[rgba(6,182,212,0.2)] shadow-[0_20px_40px_rgba(0,0,0,0.5),_0_0_60px_rgba(6,182,212,0.1)] rounded-2xl text-white z-10 top-1/2 right-1/12 transform overflow-hidden -translate-y-1/2 flex flex-col text-center w-full">

            <!-- Header -->
            <div
                class="w-full flex justify-center pt-10 pb-5 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[4px] before:bg-gradient-to-r before:from-[#1e3a8a] before:to-[#06b6d4] flex-shrink-0">
                <div class="relative inline-block">
                    <img src="/public/images/tarantool-logo.svg" alt="logo" class="w-[280px] h-auto" />
                    <span class="absolute top-0 right-0 text-[#06b6d4] text-right uppercase font-bold">admin</span>
                </div>
            </div>

            <!-- Custom Tab Navigation -->
            <div class="w-full px-8 flex-shrink-0">
                <div
                    class="flex bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-1 backdrop-blur-sm border border-gray-700/30">
                    <button @click="switchTab('login')" :class="[
                        'flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-300 ease-out',
                        tabPosition === 'login'
                            ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/25 transform scale-[1.02]'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    ]">
                        Sign In
                    </button>
                    <button @click="switchTab('register')" :class="[
                        'flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-300 ease-out',
                        tabPosition === 'register'
                            ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/25 transform scale-[1.02]'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    ]">
                        Sign Up
                    </button>
                </div>
            </div>

            <!-- Welcome Message -->
            <div class="w-full bg-gradient-to-r mt-3 flex-shrink-0">
                <span class="opacity-55">
                    {{ tabPosition === 'login' ?
                        'Welcome back! Please sign in to continue.'
                        : 'Create your account to get started.' }}
                </span>
            </div>

            <!-- Scrollable Forms Container -->
            <div class="w-full flex-1 overflow-y-auto overflow-x-hidden">
                <div class="pb-5">
                    <transition name="form-fade" mode="out-in">
                        <!-- Login Form -->
                        <el-form v-if="tabPosition === 'login'" key="login" ref="loginFormRef" :model="loginForm"
                            style="min-width: 100%" status-icon :rules="loginRules" label-width="auto"
                            class="auth-form mt-4 px-8">

                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="username"
                                class="capitalize">
                                <el-input :formatter="(value: any) => `${value}`.toUpperCase()"
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="loginForm.username" type="text" autocomplete="off"
                                    placeholder="Enter Your Username" :prefix-icon="User" @input="onUsernameInput" />
                            </el-form-item>

                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="password"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="loginForm.password" type="password" autocomplete="off"
                                    placeholder="Enter Your Password" class="capitalize" show-password
                                    :prefix-icon="Lock" />
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" size="large" color="#06b6d4" :loading="authStore.loading"
                                    class="mt-7 font-semibold font-inter w-full capitalize" @click="submitLoginForm">
                                    sign in
                                </el-button>
                            </el-form-item>
                        </el-form>

                        <!-- Register Form -->
                        <el-form v-else-if="tabPosition === 'register'" key="register" ref="registerFormRef"
                            :model="registerForm" style="min-width: 100%" status-icon :rules="registerRules"
                            label-width="auto" class="auth-form mt-4 px-8">

                            <!-- First Name -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="first_name"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.first_name" type="text" autocomplete="off"
                                    placeholder="Enter Your First Name" :prefix-icon="User" />
                            </el-form-item>

                            <!-- Last Name -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="last_name"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.last_name" type="text" autocomplete="off"
                                    placeholder="Enter Your Last Name" :prefix-icon="User" />
                            </el-form-item>

                            <!-- Username -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="user_name"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.user_name" type="text" autocomplete="off"
                                    placeholder="Enter Your Username" :prefix-icon="User"
                                    @input="onRegisterUsernameInput" />
                            </el-form-item>

                            <!-- Email -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="email"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.email" type="email" autocomplete="off"
                                    placeholder="Enter Your Email" :prefix-icon="Message" />
                            </el-form-item>

                            <!-- Password -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="password"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.password" type="password" autocomplete="off"
                                    placeholder="Enter Your Password" class="capitalize" show-password
                                    :prefix-icon="Lock" />
                            </el-form-item>

                            <!-- Confirm Password -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="confirm_password"
                                class="capitalize">
                                <el-input
                                    style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                    size="large" v-model="registerForm.confirm_password" type="password"
                                    autocomplete="off" placeholder="Confirm Your Password" class="capitalize"
                                    show-password :prefix-icon="Lock" />
                            </el-form-item>

                            <!-- Profile Photo Selection -->
                            <el-form-item style="--el-text-color-regular: white;" size="large" prop="profile_photo"
                                class="capitalize">
                                <div class="w-full flex flex-col justify-center items-center gap-2">
                                    <label class="block text-sm font-medium text-gray-300 mb-3">Choose Your
                                        Avatar</label>
                                    <div class="grid grid-cols-4 gap-4 mb-4">
                                        <div v-for="(avatar, index) in avatarOptions" :key="index"
                                            @click="selectAvatar(avatar)" :class="[
                                                'relative cursor-pointer rounded-full p-1 transition-all duration-200 hover:scale-110 w-16 h-16 flex',
                                                registerForm.profile_photo === avatar
                                                    ? 'ring-2 ring-[#06b6d4] ring-offset-2 ring-offset-transparent shadow-lg shadow-[#06b6d4]/50'
                                                    : 'hover:ring-1 hover:ring-gray-400'
                                            ]">
                                            <img :src="'/public/images/avatar/' + avatar" :alt="`Avatar ${index + 1}`"
                                                class="w-16 aspect-square rounded-full object-cover" />
                                            <div v-if="registerForm.profile_photo === avatar"
                                                class="absolute -top-1 -right-1 w-5 h-5 bg-[#06b6d4] rounded-full flex items-center justify-center">
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clip-rule="evenodd"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" size="large" color="#06b6d4" :loading="registerLoading"
                                    class="mt-7 font-semibold font-inter w-full capitalize" @click="submitRegisterForm">
                                    create account
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { type FormInstance, type FormRules } from 'element-plus'
import { Lock, User, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/toast'
import { useRouter } from 'vue-router'
import axiosInstance from '@/common/axios'
import type { RegisterRequest, User as UserModel } from '@/types/user'
import type { ApiResponse } from '@/types/axios-response'

const tabPosition = ref('login')

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const authStore = useAuthStore()
const router = useRouter()
const showCustomUrlInput = ref(false)
const registerLoading = ref(false)

// Avatar options for selection
const avatarOptions = [
    'user1.png',
    'user2.png',
    'user3.png',
    'user4.png',
    'user5.png',
    'user6.png',
    'user7.png',
    'user8.png',
    'user9.png',
    'user10.png',
    'user11.png',
    'user12.png',
]

// Tab switching function
const switchTab = (tab: string) => {
    tabPosition.value = tab
}

// Avatar selection handler
const selectAvatar = (avatarUrl: string) => {
    registerForm.profile_photo = avatarUrl
    showCustomUrlInput.value = false
}

// LOGIN FORM DATA & VALIDATION
const loginForm = reactive({
    username: '',
    password: '',
})

const validateLoginUsername = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the username'))
    } else {
        callback()
    }
}

const validateLoginPassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        callback()
    }
}

const loginRules = reactive<FormRules<typeof loginForm>>({
    username: [{ validator: validateLoginUsername, trigger: 'blur' }],
    password: [{ validator: validateLoginPassword, trigger: 'blur' }],
})

// REGISTER FORM DATA & VALIDATION
const registerForm = reactive({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    password: '',
    confirm_password: '',
    profile_photo: 'user1.png',
})

const validateFirstName = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input your first name'))
    } else if (value.length < 2) {
        callback(new Error('First name must be at least 2 characters'))
    } else {
        callback()
    }
}

const validateLastName = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input your last name'))
    } else if (value.length < 2) {
        callback(new Error('Last name must be at least 2 characters'))
    } else {
        callback()
    }
}

const validateRegisterUsername = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input a username'))
    } else if (value.length < 3) {
        callback(new Error('Username must be at least 3 characters'))
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        callback(new Error('Username can only contain letters, numbers, and underscores'))
    } else {
        callback()
    }
}

const validateEmail = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input your email address'))
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        callback(new Error('Please enter a valid email address'))
    } else {
        callback()
    }
}

const validateRegisterPassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input a password'))
    } else if (value.length < 6) {
        callback(new Error('Password must be at least 6 characters'))
    } else {
        if (registerForm.confirm_password !== '') {
            registerFormRef.value?.validateField('confirm_password')
        }
        callback()
    }
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please confirm your password'))
    } else if (value !== registerForm.password) {
        callback(new Error('Passwords do not match'))
    } else {
        callback()
    }
}

const registerRules = reactive<FormRules<typeof registerForm>>({
    first_name: [{ validator: validateFirstName, trigger: 'blur' }],
    last_name: [{ validator: validateLastName, trigger: 'blur' }],
    user_name: [{ validator: validateRegisterUsername, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [{ validator: validateRegisterPassword, trigger: 'blur' }],
    confirm_password: [{ validator: validateConfirmPassword, trigger: 'blur' }],
})

// FORM SUBMISSION HANDLERS
const submitLoginForm = () => {
    if (!loginFormRef.value) return
    loginFormRef.value.validate((valid) => {
        if (valid) {
            authStore
                .login({
                    user_name: loginForm.username,
                    password: loginForm.password,
                })
                .then(() => {
                    router.push('/')
                })
        } else {
            showToast({
                message: 'Please correct the errors in the form.',
                type: 'warning',
            })
        }
    })
}

const submitRegisterForm = () => {
    if (!registerFormRef.value) return
    registerFormRef.value.validate(async (valid) => {
        if (valid) {
            registerLoading.value = true
            try {
                const registerData: RegisterRequest = {
                    first_name: registerForm.first_name,
                    last_name: registerForm.last_name,
                    user_name: registerForm.user_name,
                    email: registerForm.email,
                    password: registerForm.password,
                    confirm_password: registerForm.confirm_password,
                    profile_photo: registerForm.profile_photo
                }

                const response = await axiosInstance.post("/front/auth/register", registerData) as ApiResponse<{ user_info: UserModel }>
                if (response.success) {
                    showToast({
                        message: response.message || 'You registered successfully',
                        type: "success",
                    })

                    loginForm.username = registerForm.user_name
                    loginForm.password = registerForm.password
                    registerLoading.value = false
                    tabPosition.value = 'login'
                } else {
                    showToast({
                        message: response.message || 'Failed to register',
                        type: "error",
                        desc: response.data.error,
                    });
                }
            } catch (error: any) {
                console.error('Failed to register account:', error);
                showToast({
                    message: error?.message || 'Failed to register',
                    type: "error",
                    desc: error?.data?.error
                });
            } finally {
                registerLoading.value = false
            }

        } else {
            showToast({
                message: 'Please correct the errors in the form.',
                type: 'warning',
            })
        }
    })
}

// INPUT HANDLERS
const onUsernameInput = (val: string) => {
    const cleanVal = val.replace(/\s+/g, '').toUpperCase()
    loginForm.username = cleanVal
}

const onRegisterUsernameInput = (val: string) => {
    const cleanVal = val.replace(/\s+/g, '').toUpperCase()
    registerForm.user_name = cleanVal
}
</script>

<style scoped>
/* Fast and smooth form transitions */
.form-fade-enter-active {
    transition: all 0.2s ease-out;
}

.form-fade-leave-active {
    transition: all 0.15s ease-in;
}

.form-fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.form-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

/* Fixed form container to prevent height jumping */
.auth-form {
    width: 100%;
    will-change: transform, opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
}

/* Smooth button transitions */
.auth-form .el-button {
    transition: all 0.2s ease;
}

/* Smooth input transitions */
.auth-form .el-input__wrapper {
    transition: all 0.2s ease;
}

/* Prevent layout shift during transitions */
.auth-form .el-form-item {
    margin-bottom: 22px;
}

.auth-form .el-form-item:last-child {
    margin-bottom: 0;
}

/* Smooth scrollbar styling for form container */
.w-full.flex-1.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(6, 182, 212, 0.5) rgba(15, 23, 42, 0.3);
}

.w-full.flex-1.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.w-full.flex-1.overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.3);
    border-radius: 3px;
}

.w-full.flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.5);
    border-radius: 3px;
}

.w-full.flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.7);
}
</style>
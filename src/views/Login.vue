<template>
    <div class="relative w-full h-screen">
        <!-- Video Background -->
        <div class="absolute inset-0 z-[1] -left-[10%]">
            <video autoplay loop muted playsinline class="w-full h-full object-cover">
                <source src="/public/videos/background/vk-tarantool_empty.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>

        <!-- Login Container Positioned Right & Centered Vertically -->
        <!-- <div
            class="relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-[#1e3a8a] before:to-[#06b6d4]">
        </div> -->

        <div
            class="absolute gap-2 max-w-[450px] min-w-[280px] pb-5 border-t-none  bg-gradient-to-br from-[#000000] to-[#0f172a] border border-[rgba(6,182,212,0.2)] shadow-[0_20px_40px_rgba(0,0,0,0.5),_0_0_60px_rgba(6,182,212,0.1)] rounded-2xl text-white z-10 top-1/2 right-1/12 transform overflow-hidden -translate-y-1/2 flex items-center flex-col justify-center text-center w-full">
            <div
                class="w-full flex justify-center pt-10 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[4px] before:bg-gradient-to-r before:from-[#1e3a8a] before:to-[#06b6d4]">
                <div class="relative inline-block">
                    <img src="/public/images/tarantool-logo.svg" alt="logo" class="w-[280px] h-auto" />
                    <span class="absolute top-0 right-0 text-[#06b6d4] text-right uppercase font-bold">admin</span>
                </div>
            </div>
            <div class=" w-full bg-gradient-to-r mt-5">
                <!-- <h3 class="text-2xl font-semibold font-inter capitalize">welcome back!</h3> -->
                <span class="opacity-55">Welcome back! Please sign in to continue.</span>
            </div>

            <el-form ref="ruleFormRef" :model="ruleForm" style="min-width: 100%" status-icon :rules="rules"
                label-width="auto" class="demo-ruleForm mt-4 px-8">
                <el-form-item style="--el-text-color-regular: white;" size="large" prop="username" class="capitalize">

                    <el-input :formatter="(value: any) => `${value}`.toUpperCase()"
                        style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                        size="large" v-model="ruleForm.username" type="text" autocomplete="off"
                        placeholder="Enter Your Username" :prefix-icon="User" @input="onUsernameInput" />
                </el-form-item>
                <el-form-item style="--el-text-color-regular: white;" size="large" prop="password" class="capitalize">
                    <el-input
                        style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                        size="large" v-model="ruleForm.password" type="password" autocomplete="off"
                        placeholder="Enter Your Password" class="capitalize" show-password :prefix-icon="Lock" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" color="#06b6d4"
                        class="mt-7 font-semibold font-inter w-full capitalize" @click="submitForm(ruleFormRef)">
                        sign in
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {type FormInstance, type FormRules } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth/store'
import { showToast } from '@/utils/toast'
import { useRouter } from 'vue-router'

const ruleFormRef = ref<FormInstance>()
const authStore = useAuthStore()
const router = useRouter()

const validateUsername = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the username'))
    } else {
        callback()
    }
}
const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    username: '',
    password: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      authStore
        .login(
          {
            user_name: ruleForm.username,
            password: ruleForm.password,
          },
        ).then(() => {
          // ✅ Redirect on successful login
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

const onUsernameInput = (val: string) => {
  // Remove spaces and convert to uppercase
  const cleanVal = val.replace(/\s+/g, '').toUpperCase()
  ruleForm.username = cleanVal
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}
</script>

<style scoped></style>
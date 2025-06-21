import { defineStore } from "pinia"
import type { UserInfo } from "./type"
import axiosInstance from "@/common/axios"
import type { ApiResponse } from "@/types/axios-response"

export const useUserStore = defineStore('user', {
  state: (): { userInfo: UserInfo | null } => ({
    userInfo: null,
  }),

  getters: {

  },

  actions: {
    async fetchUserInfo() {
        console.log("helllllllllloooooooooo")
        try {
            const response = await axiosInstance.get("/front/user/info") as ApiResponse<{user_info: UserInfo}>
            if (response.success) {
                this.userInfo = response.data.user_info
                console.log("====user_info======", this.userInfo)
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error)
        }
    }
  },
})
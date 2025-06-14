import { defineStore } from "pinia";
import type { AuthStates, LoginPayloadRequest } from "./type";
import axios from "axios";
import { showToast } from "@/utils/toast";

const baseUrl = import.meta.env.VITE_BASE_URL;
export const useAuthStore = defineStore("auth", {
  state: (): AuthStates => ({
    token: localStorage.getItem("authToken"),
    message: "",
    loading: false,
    isLogout: true,
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.token;
    },
  },

  actions: {
    async login(payload: LoginPayloadRequest) {
      this.loading = true;
      this.message = "";
      try {
        const response = await axios.post(
          baseUrl + "/front/auth/login",
          payload,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        const tokenResponse = response.data.data.auth.token;
        const messageResponse = response.data.message;
        this.token = tokenResponse;
        this.message = messageResponse;

        if (tokenResponse) {
          
          localStorage.setItem("authToken", tokenResponse);
          this.isLogout = false;
            showToast({
              message: messageResponse,
              type: "success"
            })
        } else {
          
          this.token = null;
          localStorage.removeItem("authToken");
          this.message = messageResponse || "Login failed. Please try again.";
          
        }

        return response;
      } catch (error: any) {
        showToast({
          message: error.response.data.message,
          type: "error",
          desc: error.response.data.data.error
        })
        console.error("Login failed:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.message = error.response.data.message;
          this.isLogout = false;
        } else {
          this.message = "Login failed. Please try again.";
        }
        this.token = null;
        localStorage.removeItem("authToken");
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.isLogout = true;
      this.message = "Logged out successfully.";
      localStorage.removeItem("authToken");
    },
  },
});

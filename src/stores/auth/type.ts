export interface LoginPayloadRequest {
    user_name: string;
    password: string;
}

export interface AuthStates {
  token: string | null;
  message: string;
  loading: boolean;
  isLogout: boolean;
}
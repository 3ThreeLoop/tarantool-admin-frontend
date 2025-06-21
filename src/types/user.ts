export interface User {
  user_uuid: string;
  first_name: string;
  last_name: string;
  user_name: string;
  password: string;
  email: string;
  profile_photo: string;
  status_id: number;
  order: number;
  created_by: number;
  created_at: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  user_name: string;
  password: string;
  confirm_password: string;
  email: string;
  profile_photo: string;
}
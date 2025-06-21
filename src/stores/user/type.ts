export interface UserDatabase {
  db_uuid: string;
  db_name: string;
}

export interface UserInfo {
  user_uuid: string;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  profile_photo: string;
  user_databases: UserDatabase[];
}

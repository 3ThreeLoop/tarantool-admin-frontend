export interface Database {
  user_id: number;
  db_uuid: string;
  db_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  is_active: boolean;
}

export interface DatabaseRequest {
  db_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}
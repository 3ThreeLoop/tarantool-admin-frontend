interface SuccessResponse<T> {
  success: true;
  message: string;
  status_code: number;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  status_code: number;
  data: {
    error: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
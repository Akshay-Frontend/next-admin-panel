export interface ApiError {
  status: number;
  message: string;
  isNetwork: boolean;
  isAuth: boolean;
}

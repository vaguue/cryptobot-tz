export type AuthPayload = {
  userTgId: number;
};

export type InitDataBody = {
  initData: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiSuccessMessage = {
  success: true;
  message: string;
};

export type ApiFailure = {
  success: false;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type RecaptchaResponse = {
  success: boolean;
  score?: number;
};

export type UserStatsPayload = {
  id: number;
  clicks: number;
  rank: number;
};

export type PaginatedData<T> = {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  me?: T;
};

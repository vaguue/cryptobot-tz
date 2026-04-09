export type AuthPayload = {
  userTgId: number;
};

/** Cookie name for JWT (legacy `oCookies.auth`). */
export const oCookies = {
  auth: "auth_token" as const,
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

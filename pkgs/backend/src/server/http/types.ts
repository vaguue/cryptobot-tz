export type AuthPayload = {
  userTgId: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
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

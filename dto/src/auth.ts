export type RegisterRequestDto = {
  email: string;
  password: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type VerifyEmailRequestDto = {
  email: string;
  token: string;
};

export type ForgotPasswordRequestDto = {
  email: string;
};

export type ResetPasswordRequestDto = {
  email: string;
  token: string;
  password: string;
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUserDto = {
  id: string;
  email: string;
  isEmailVerified: boolean;
};

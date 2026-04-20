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

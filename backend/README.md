# Backend (NestJS)

Backend service for IRB Explorer authentication.

## Features
- JWT access + refresh tokens
- Email verification before login
- `@lpnu.ua` email restriction
- Refresh token hashing + rotation
- Prisma migrations for PostgreSQL
- SMTP verification emails with graceful fallback to logs in dev

## Environment
Copy `.env.example` to `.env` and fill values:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `EMAIL_VERIFICATION_TTL_HOURS`
- `PASSWORD_RESET_TTL_HOURS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- `FRONTEND_URL`

## Run in Docker (recommended)
From repo root:
```bash
npm run docker:up
```

Backend:
- URL: `http://localhost:3000`
- API prefix: `/api`

## Endpoints
Base: `http://localhost:3000/api/auth`

- `POST /register`
- `POST /verify-email`
- `POST /resend-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /login`
- `POST /refresh`
- `POST /logout` (Bearer access token)
- `GET /me` (Bearer access token)

## Request examples
Register:
```json
{
  "email": "name.surname.xx.xxxx@lpnu.ua",
  "password": "StrongPass123!"
}
```

Verify email:
```json
{
  "email": "name.surname.xx.xxxx@lpnu.ua",
  "token": "token_from_email_or_logs"
}
```

Login:
```json
{
  "email": "name.surname.xx.xxxx@lpnu.ua",
  "password": "StrongPass123!"
}
```

Refresh:
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

## Local development without SMTP
If SMTP config is missing or provider rejects sending:
- backend logs verification token
- registration still succeeds
- you can verify user using token from logs
- password reset token is also logged the same way

# Bachelor Monorepo

Monorepo for IRB Explorer with:
- `frontend` - Next.js client (classmate part)
- `backend` - NestJS + Prisma + PostgreSQL auth API
- `dto` - shared DTO/types package for both sides

## Tech stack
- NestJS + TypeScript
- PostgreSQL
- Prisma ORM + migrations
- JWT auth (access + refresh)
- Email verification (`@lpnu.ua` only)
- Docker Compose (`db` + `backend`)

## Quick start for teammate
1. Clone repo.
2. Copy backend env:
   - use `backend/.env.example` as template
   - configure SMTP values (Brevo/Mailtrap/etc.)
3. Start services:
   - `npm run docker:up`
4. Check health:
   - open `http://localhost:3000/api`
   - expected: `{"status":"ok"}`

## Useful commands
- Start all containers: `npm run docker:up`
- Stop containers: `npm run docker:down`
- Backend logs: `npm run docker:logs`
- Build backend locally: `npm run backend:build`

## Auth API overview
Base URL: `http://localhost:3000/api`

- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

See backend details in `backend/README.md`.

## Notes
- Registration is restricted to `@lpnu.ua` emails.
- If SMTP is not configured or provider rejects sending, backend logs verification token and continues (dev-safe fallback).

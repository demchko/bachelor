# Auth Flow (IRB Explorer)

## Registration and verification
1. User calls `POST /api/auth/register` with `@lpnu.ua` email and password.
2. Backend creates unverified user.
3. Backend generates verification token, stores hash + expiry in DB.
4. Backend sends verification email (or logs token fallback in dev).
5. User confirms via `POST /api/auth/verify-email`.
6. Backend marks account as verified.

## Login and session
1. User calls `POST /api/auth/login`.
2. Backend checks:
   - user exists and active
   - password matches
   - email is verified
3. Backend returns:
   - `accessToken` (short TTL)
   - `refreshToken` (long TTL)
4. Refresh token hash is stored in DB.

## Refresh and logout
- `POST /api/auth/refresh` validates refresh token and rotates token pair.
- `POST /api/auth/logout` clears stored refresh hash.

## Security decisions
- Passwords hashed with Argon2.
- Refresh token stored only as hash.
- Verification token stored only as hash.
- Generic invalid-credential errors for login.
- DTO validation via `class-validator`.

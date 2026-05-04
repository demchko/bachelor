# Auth Flow (IRB Explorer)

## Registration and verification
1. User calls `POST /api/auth/register` with `@lpnu.ua` email and password.
2. Backend creates unverified user.
3. Backend generates verification token, stores hash + expiry in DB.
4. Backend sends verification email (or logs token fallback in dev).
5. User opens link `FRONTEND_URL/verify-email?token=…&email=…` — frontend strips query from the address bar, verifies via `POST /api/auth/verify-email` without showing token fields.
6. If token expired or invalid: user can **resend verification** or **register again** (same flows as UI).
7. `POST /api/auth/resend-verification` returns **400** if email is unknown (explicit message), **200** if already verified or email resent.

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

## Password reset / «Забули пароль»
1. User calls `POST /api/auth/forgot-password` with `@lpnu.ua` email (same entry point as «activation link»).
2. If user exists and is active but **email not verified**: backend sends **verification / activation** email (same as after register), not password reset.
3. If **email verified**: backend sends password reset link to `FRONTEND_URL/reset-password?token=...&email=...`.
4. SMTP must work for this flow (`mustDeliver` for activation branch); failures return `503`, verification token cleared if send fails.
5. `POST /api/auth/reset-password` applies only after verified email.

### SMTP / листи не приходять
- На старті бекенд робить `verify()` транспорту; якщо помилка — див. лог контейнера `bachelor-backend`.
- У провайдера (наприклад Brevo) має бути **підтверджений відправник**; `MAIL_FROM` збігатиметься з тим, що дозволено в панелі.
- Корпоративна пошта `@lpnu.ua` часто кидає листи в **Спам** або блокує зовнішні SMTP — перевірте обидві папки та політику пошти.
- Після зміни `backend/.env` перезапустіть контейнер бекенду, щоб підхопив нові змінні.

## Security decisions
- Passwords hashed with Argon2.
- Refresh token stored only as hash.
- Verification token stored only as hash.
- Generic invalid-credential errors for login.
- DTO validation via `class-validator`.

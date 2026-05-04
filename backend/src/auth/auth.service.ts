import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { MailerService } from '../mailer/mailer.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    this.assertUniversityEmail(email);

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException(
        'Ця email-адреса вже зареєстрована. Спробуйте увійти або натисніть «Забули пароль» — на пошту надійде лист для входу.',
      );
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.usersService.create({
      email,
      passwordHash,
    });

    const verificationToken = this.createVerificationToken();
    await this.setVerificationToken(user.id, verificationToken);
    await this.mailerService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Реєстрація успішна. Перевірте пошту та відкрийте посилання з листа, щоб активувати акаунт.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.emailVerificationTokenHash || !user.emailVerificationExpiresAt) {
      throw new BadRequestException(
        'Посилання недійсне або вже використане. Запросіть новий лист підтвердження.',
      );
    }

    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Термін дії посилання вичерпано. Натисніть «Надіслати лист повторно» або зареєструйтесь знову.',
      );
    }

    const isMatch = await argon2.verify(user.emailVerificationTokenHash, dto.token);
    if (!isMatch) {
      throw new BadRequestException(
        'Недійсний код підтвердження. Запросіть новий лист або перевірте посилання з останнього листа.',
      );
    }

    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email успішно підтверджено.' };
  }

  async resendVerification(emailRaw: string) {
    const email = emailRaw.toLowerCase();
    this.assertUniversityEmail(email);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        'Облікового запису з цією адресою немає. Перевірте написання або зареєструйтесь.',
      );
    }

    if (user.isEmailVerified) {
      return { message: 'Email уже підтверджено — можете увійти.' };
    }

    const verificationToken = this.createVerificationToken();
    await this.setVerificationToken(user.id, verificationToken);
    await this.mailerService.sendVerificationEmail(user.email, verificationToken);
    return { message: 'Лист із посиланням надіслано. Перевірте пошту.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Користувача з такою email-адресою не знайдено.');
    }
    if (!user.isActive) {
      throw new BadRequestException('Обліковий запис вимкнено. Зверніться до підтримки.');
    }

    const inboxHint =
      'Перевірте пошту та папку «Спам»: надіслано лист із посиланням для входу в систему.';

    // Неактивований акаунт: той самий «Забули пароль» надсилає лист активації (як після реєстрації)
    if (!user.isEmailVerified) {
      const verificationToken = this.createVerificationToken();
      await this.setVerificationToken(user.id, verificationToken);
      try {
        await this.mailerService.sendVerificationEmail(user.email, verificationToken, {
          mustDeliver: true,
        });
      } catch (err) {
        await this.usersService.updateEmailVerificationToken(user.id, null, null);
        throw err;
      }
      return { message: inboxHint };
    }

    const token = this.createVerificationToken();
    await this.setPasswordResetToken(user.id, token);
    try {
      await this.mailerService.sendPasswordResetEmail(user.email, token);
    } catch (err) {
      await this.usersService.updatePasswordResetToken(user.id, null, null);
      throw err;
    }

    return { message: inboxHint };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      throw new BadRequestException('Посилання для скидання пароля недійсне. Запросіть нове.');
    }

    if (user.passwordResetExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Посилання для скидання пароля застаріло. Запросіть нове.');
    }

    const isMatch = await argon2.verify(user.passwordResetTokenHash, dto.token);
    if (!isMatch) {
      throw new BadRequestException('Посилання для скидання пароля недійсне.');
    }

    const passwordHash = await argon2.hash(dto.password);
    await this.usersService.updatePasswordFromReset(user.id, passwordHash);

    return { message: 'Пароль оновлено. Тепер можете увійти.' };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordOk = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Спочатку активуйте акаунт за посиланням з пошти або натисніть «Забули пароль», щоб отримати новий лист.',
      );
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.usersService.updateRefreshTokenHash(user.id, await argon2.hash(tokens.refreshToken));

    return {
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const decoded = await this.jwtService.verifyAsync<{ sub: string; email: string }>(
      refreshToken,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    const user = await this.usersService.findById(decoded.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.usersService.updateRefreshTokenHash(user.id, await argon2.hash(tokens.refreshToken));

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { message: 'Logged out.' };
  }

  private assertUniversityEmail(email: string) {
    if (!email.endsWith('@lpnu.ua')) {
      throw new BadRequestException('Only @lpnu.ua email addresses are allowed.');
    }
  }

  private createVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async setVerificationToken(userId: string, token: string): Promise<void> {
    const ttlHours = Number(this.configService.get<string>('EMAIL_VERIFICATION_TTL_HOURS') ?? 24);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    await this.usersService.updateEmailVerificationToken(
      userId,
      await argon2.hash(token),
      expiresAt,
    );
  }

  private async setPasswordResetToken(userId: string, token: string): Promise<void> {
    const ttlHours = Number(this.configService.get<string>('PASSWORD_RESET_TTL_HOURS') ?? 1);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    await this.usersService.updatePasswordResetToken(
      userId,
      await argon2.hash(token),
      expiresAt,
    );
  }

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };
    const accessTtl = this.configService.get<string>('JWT_ACCESS_TTL') ?? '15m';
    const refreshTtl = this.configService.get<string>('JWT_REFRESH_TTL') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl as never,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl as never,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

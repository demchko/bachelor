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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
      throw new BadRequestException('Email is already registered.');
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
      message: 'Registration successful. Please verify your email.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.emailVerificationTokenHash || !user.emailVerificationExpiresAt) {
      throw new BadRequestException('Invalid verification request.');
    }

    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification token expired.');
    }

    const isMatch = await argon2.verify(user.emailVerificationTokenHash, dto.token);
    if (!isMatch) {
      throw new BadRequestException('Invalid verification token.');
    }

    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email verified successfully.' };
  }

  async resendVerification(emailRaw: string) {
    const email = emailRaw.toLowerCase();
    this.assertUniversityEmail(email);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a verification email has been sent.' };
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified.' };
    }

    const verificationToken = this.createVerificationToken();
    await this.setVerificationToken(user.id, verificationToken);
    await this.mailerService.sendVerificationEmail(user.email, verificationToken);
    return { message: 'Verification email sent.' };
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
      throw new ForbiddenException('Email is not verified.');
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

import { IsEmail, Matches } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail()
  @Matches(/^[^@\s]+@lpnu\.ua$/i, { message: 'Only @lpnu.ua email addresses are allowed.' })
  email: string;
}

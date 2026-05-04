import { IsEmail, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @Matches(/^[^@\s]+@lpnu\.ua$/i, { message: 'Only @lpnu.ua email addresses are allowed.' })
  email: string;
}

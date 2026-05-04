import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @Matches(/^[^@\s]+@lpnu\.ua$/i, { message: 'Only @lpnu.ua email addresses are allowed.' })
  email: string;

  @IsString()
  @MinLength(20)
  token: string;

  @IsString()
  @MinLength(8)
  password: string;
}

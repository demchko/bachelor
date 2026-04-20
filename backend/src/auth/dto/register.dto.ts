import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Matches(/^[^@\s]+@lpnu\.ua$/i, { message: 'Only @lpnu.ua email addresses are allowed.' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

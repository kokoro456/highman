import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다' })
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

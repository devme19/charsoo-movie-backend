import { IsPhoneNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('IR')
  phone: string;

  @IsString()
  code: string;
}

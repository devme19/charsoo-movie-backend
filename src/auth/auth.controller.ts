import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    await this.authService.sendOtp(sendOtpDto.phone);
    return { message: 'OTP sent' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const token = await this.authService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.code,
    );
    return token;
  }
  @Post('login-admin')
  async loginAdmin(@Body() body: { phoneNumber: string; password: string }) {
    return this.authService.loginAdmin(body.phoneNumber, body.password);
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity'; // مسیر صحیح را تنظیم کن
import { Role } from 'src/commons/enums/roles.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(phoneNumber: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه اعتبار

    let user = await this.userRepository.findOne({ where: { phoneNumber } });

    if (!user) {
      user = this.userRepository.create({
        phoneNumber,
        role: Role.User,
      });
    }

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;

    await this.userRepository.save(user);

    console.log(`Sending OTP ${otp} to phone ${phoneNumber}`);
    // ارسال پیامک واقعی اینجا باید اضافه شود
  }

  async verifyOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.otpCode || user.otpCode !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    // پاک کردن کد OTP پس از تایید
    user.otpCode = null;
    user.otpExpiresAt = null;
    await this.userRepository.save(user);

    // Payload توکن JWT
    const payload = { userId: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
  async loginAdmin(phoneNumber: string, password: string) {
    const user = await this.userRepository.findOne({ where: { phoneNumber } });

    if (!user)
      throw new NotFoundException('User with this phone number not found');

    if (!user.passwordHash)
      throw new UnauthorizedException('User has no password set');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Incorrect password');

    if (user.role !== Role.Admin)
      throw new ForbiddenException('Access denied. User is not an admin');

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    return { accessToken: token };
  }
}

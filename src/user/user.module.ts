import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // ثبت Entity کاربر
  ],
  exports: [TypeOrmModule], // صادر کردن برای استفاده در ماژول‌های دیگر
})
export class UserModule {}

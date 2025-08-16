import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/entity/user.entity'; // مسیر مدل یوزر
import { MovieModule } from './movie/movie.module';
import { AdminModule } from './admin/admin.module';
import { ActorModule } from './actor/actor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mehdi1365',
      database: 'charsoomovie',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]), // ثبت entity در ماژول
    AuthModule,
    UserModule,
    MovieModule,
    AdminModule,
    ActorModule,
  ],
})
export class AppModule {}

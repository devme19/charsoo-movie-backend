// src/db/data-source.ts
import { DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'mehdi1365',
  database: process.env.DB_NAME || 'charsoomovie',
  synchronize: true, // فقط در dev فعال باشه
  logging: false,
  entities: [User], // همه entity‌ها رو اینجا بیار
});

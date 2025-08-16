import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/commons/enums/roles.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // معادل _id در mongoose

  @Column({ unique: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Column({ type: 'varchar', nullable: true, default: null })
  otpCode?: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  otpExpiresAt?: Date | null;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  passwordHash?: string;
}

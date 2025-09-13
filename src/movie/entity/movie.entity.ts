import { Actor } from 'src/actor/entity/actor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  director?: string;

  @Column({ nullable: true })
  releaseYear?: number;

  @Column({ nullable: true })
  durationMinutes?: number;

  @Column('simple-array', { nullable: true })
  genres?: string[];

  @Column('simple-array', { nullable: true })
  countries?: string[];

  @ManyToMany(() => Actor, (actor) => actor.movies, { cascade: true })
  @JoinTable()
  actors: Actor[];

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ nullable: true })
  videoKey: string;

  @Column({ nullable: true })
  thumbnailKey: string;

  @Column({ default: false })
  isPremium: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actor } from './entity/actor.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
  ) {}

  async create(createActorDto: CreateActorDto): Promise<Actor> {
    const actor = this.actorRepository.create(createActorDto);
    return await this.actorRepository.save(actor);
  }

  async findAll(name?: string): Promise<Actor[]> {
    const query = this.actorRepository
      .createQueryBuilder('actor')
      .leftJoinAndSelect('actor.movies', 'movie');

    if (name) {
      query.where('actor.name ILIKE :name', { name: `%${name}%` });
    }
    query.select(['actor.name', 'actor.photoUrl']);
    return query.getMany();
  }

  async findById(id: string): Promise<Actor> {
    const actor = await this.actorRepository.findOne({
      where: { id },
      relations: ['movies'],
    });
    if (!actor) throw new NotFoundException('Actor not found');
    return actor;
  }

  async update(id: string, updateDto: UpdateActorDto): Promise<Actor> {
    const actor = await this.findById(id);
    Object.assign(actor, updateDto);
    return this.actorRepository.save(actor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.actorRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Actor not found');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async findAll() {
    const directors = await this.directorRepository.find();

    if (!directors) {
      throw new NotFoundException('');
    }

    return directors;
  }

  findOne(id: number) {
    return this.directorRepository.findOne({ where: { id } });
  }

  async create(createDirectorDto: CreateDirectorDto) {
    return await this.directorRepository.save(createDirectorDto);
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorRepository.findOne({ where: { id } });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    await this.directorRepository.update({ id }, updateDirectorDto);

    const newDirector = this.directorRepository.findOne({ where: { id } });

    return newDirector;
  }

  async remove(id: number) {
    const director = await this.directorRepository.findOne({ where: { id } });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    await this.directorRepository.delete(id);

    return id;
  }
}

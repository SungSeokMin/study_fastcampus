import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import { Movie } from 'src/movie/entity/movie.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTargets = files.filter((file) => {
      const split = parse(file).name.split('_');

      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 24 * 60 * 60 * 1000;

        const now = +new Date();

        return now - date > aDayInMilSec;
      } catch (error) {
        console.error(error);

        return true;
      }
    });

    await Promise.all(
      deleteFilesTargets.map((file) => unlink(join(process.cwd(), 'public', 'temp', file))),
    );

    console.log('🔥tasks.service: 34줄🔥', deleteFilesTargets);
  }

  // @Cron('0 * * * * *')
  async calculateMovieLikeCounts() {
    console.log('🔥tasks.service: 50줄🔥', 'run');
    await this.movieRepository.query(
      `
      UPDATE movie m
      SET "likeCount" = (
        SELECT count(*) FROM movie_user_like mul
                        WHERE m.id = mul."movieId" AND mul."isLike" = true
      );`,
    );

    await this.movieRepository.query(
      `
      UPDATE movie m
      SET "dislikeCount" = (
        SELECT count(*) FROM movie_user_like mul
                        WHERE m.id = mul."movieId" AND mul."isLike" = false
      );`,
    );
  }
}

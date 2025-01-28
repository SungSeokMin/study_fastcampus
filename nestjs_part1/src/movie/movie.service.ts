import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entity/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { envVariablesKeys } from 'src/common/const/env.const';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async findRecent() {
    const cacheData = await this.cacheManager.get('MOVIE_RECENT');

    if (cacheData) {
      return cacheData;
    }

    const data = await this.movieRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    // TTL: 메모리에 존재하는 시간
    await this.cacheManager.set('MOVIE_RECENT', data);

    return data;
  }

  /* istanbul ignore next */
  async getMovies() {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');
  }

  /* istanbul ignore next */
  async getLikedMovies(movieIds: number[], userId: number) {
    return this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.user', 'user')
      .leftJoinAndSelect('mul.movie', 'movie')
      .where('movie.id IN(:...movieIds)', { movieIds })
      .andWhere('user.id = :userId', { userId })
      .getMany();
  }

  async findAll(dto: GetMoviesDto, userId?: number) {
    const { title } = dto;

    const qb = await this.getMovies();

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const result = await qb.getManyAndCount();
    let data = result[0];
    const count = result[1];

    if (userId) {
      const movieIds = data.map((movie) => movie.id);

      const likedMovies = movieIds.length < 1 ? [] : await this.getLikedMovies(movieIds, userId);

      const likedMovieMap = likedMovies.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.movie.id]: cur.isLike,
        }),
        {},
      );

      data = data.map((x) => ({
        ...x,
        likeStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
      }));
    } else {
      data = data.map((x) => ({ ...x, likeStatus: null }));
    }

    return {
      data,
      nextCursor,
      count,
    };
  }

  /* istanbul ignore next */
  async findMovieDetail(id: number) {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')
      .where('movie.id = :id', { id })
      .getOne();
  }

  async findOne(id: number) {
    const movie = await this.findMovieDetail(id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    return movie;
  }

  /* istanbul ignore next */
  async createMovieDetail(qr: QueryRunner, createMovieDto: CreateMovieDto) {
    const { detail } = createMovieDto;

    return qr.manager.createQueryBuilder().insert().into(MovieDetail).values({ detail }).execute();
  }

  /* istanbul ignore next */
  async createMovie(
    qr: QueryRunner,
    createMovieDto: CreateMovieDto,
    director: Director,
    movieDetailId: number,
    userId: number,
    movieFolder: string,
  ) {
    const { title, detail, movieFileName } = createMovieDto;

    return qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title,
        detail: {
          id: movieDetailId,
          detail,
        },
        director,
        movieFilePath: join(movieFolder, movieFileName),
        creator: {
          id: userId,
        },
      })
      .execute();
  }

  /* istanbul ignore next */
  async createMovieGenreRelation(qr: QueryRunner, movieId: number, genres: Genre[]) {
    return qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((genre) => genre.id));
  }

  /* istanbul ignore next */
  async renameMovieFile(tempFolder: string, movieFolder: string, createMovieDto: CreateMovieDto) {
    const { movieFileName } = createMovieDto;

    if (this.configService.get<string>(envVariablesKeys.env) !== 'prod') {
      return rename(
        join(process.cwd(), tempFolder, movieFileName),
        join(process.cwd(), movieFolder, movieFileName),
      );
    } else {
      return this.commonService.saveMovieToPermanentStorage(movieFileName);
    }
  }

  async create(createMovieDto: CreateMovieDto, userId: number, qr: QueryRunner) {
    const { directorId, genreIds } = createMovieDto;

    const director = await qr.manager.findOne(Director, { where: { id: directorId } });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    const genres = await qr.manager.find(Genre, { where: { id: In(genreIds) } });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 장르가 있습니다. 존재하는 ID는 ${genres.map((genre) => genre.id).join(', ')} `,
      );
    }

    const movieDetail = await this.createMovieDetail(qr, createMovieDto);

    const movieDetailId = movieDetail.identifiers[0].id;

    const movieFolder = join('public', 'movie');
    const tempFolder = join('public', 'temp');

    const movie = await this.createMovie(
      qr,
      createMovieDto,
      director,
      movieDetailId,
      userId,
      movieFolder,
    );

    const movieId = movie.identifiers[0].id;

    await this.createMovieGenreRelation(qr, movieId, genres);

    await this.renameMovieFile(tempFolder, movieFolder, createMovieDto);

    return await qr.manager.findOne(Movie, {
      where: { id: movieId },
      relations: ['detail', 'director', 'genres'],
    });
  }

  /* istanbul ignore next */
  updateMovie(qr: QueryRunner, movieUpdateFields: UpdateMovieDto, id: number) {
    return qr.manager
      .createQueryBuilder()
      .update(Movie)
      .set(movieUpdateFields)
      .where('id = :id', { id })
      .execute();
  }

  /* istanbul ignore next */
  updateMovieDetail(qr: QueryRunner, detail: string, movie: Movie) {
    return qr.manager
      .createQueryBuilder()
      .update(MovieDetail)
      .set({
        detail,
      })
      .where('id = :id', { id: movie.detail.id })
      .execute();
  }

  /* istanbul ignore next */
  updateMovieGenreRelation(qr: QueryRunner, id: number, newGenres: Genre[], movie: Movie) {
    return qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(id)
      .addAndRemove(
        newGenres.map((genre) => genre.id),
        movie.genres.map((genre) => genre.id),
      );
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: {
          id,
        },
        relations: ['detail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector: Director;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId },
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        newDirector = director;
      }

      let newGenres: Genre[];

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: { id: In(genreIds) },
        });

        if (genres.length !== updateMovieDto.genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(',')}`,
          );
        }

        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await this.updateMovie(qr, movieUpdateFields, id);

      if (detail) {
        await this.updateMovieDetail(qr, detail, movie);
      }

      if (newGenres) {
        await this.updateMovieGenreRelation(qr, id, newGenres, movie);
      }

      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();

      throw e;
    } finally {
      await qr.release();
    }
  }

  /* istanbul ignore next */
  deleteMovie(id: number) {
    return this.movieRepository.createQueryBuilder().delete().where('id = :id', { id }).execute();
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    await this.deleteMovie(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }

  /* istanbul ignore next */
  getLikedRecord(movieId: number, userId: number) {
    return this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({ where: { id: movieId } });

    if (!movie) {
      throw new BadRequestException('존재하지 않는 영화입니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 유저입니다.');
    }

    const likeRecord = await this.getLikedRecord(movieId, userId);

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({ movie, user });
      } else {
        await this.movieUserLikeRepository.update(
          {
            movie,
            user,
          },
          { isLike },
        );
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      });
    }

    const result = await this.getLikedRecord(movieId, userId);

    return {
      isLike: result && result.isLike,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Movie } from './app.controller';

@Injectable()
export class AppService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의 제왕',
    },
  ];

  private idCounter: number = 3;

  getManyMovies(title?: string) {
    if (!title) {
      return this.movies;
    }

    return this.movies.filter((movie) => movie.title.startsWith(title));
  }

  getMovieById(id: number) {
    const movie = this.movies.find((movie) => movie.id === id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    return movie;
  }

  createMovie(title: string) {
    const movie: Movie = {
      id: this.idCounter++,
      title,
    };

    this.movies.push(movie);

    return movie;
  }

  updateMovie(id: number, title: string) {
    const movie = this.movies.find((movie) => movie.id === id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    Object.assign(movie, { title });

    return movie;
  }

  deleteMovie(id: number) {
    const movieIndex = this.movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    this.movies.splice(movieIndex, 1);

    return id;
  }
}

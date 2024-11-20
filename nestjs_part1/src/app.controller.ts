import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

interface Movie {
  id: number;
  title: string;
}

@Controller('movie')
export class AppController {
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

  constructor(private readonly appService: AppService) {}

  @Get()
  getMovies() {
    return this.movies;
  }

  @Get(':id')
  getMovie() {
    return {
      id: 1,
      title: '해리포터',
    };
  }

  @Post()
  postMovie() {
    return {
      id: 3,
      title: '어벤져스',
    };
  }

  @Patch(':id')
  patchMovie() {
    return {
      id: 3,
      title: '어벤져스',
    };
  }

  @Delete(':id')
  deleteMovie() {
    return 3;
  }
}

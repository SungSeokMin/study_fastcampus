import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  findAll(@Query('title', MovieTitleValidationPipe) title?: string) {
    return this.movieService.findAll(title);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateMovieDto) {
    return this.movieService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}

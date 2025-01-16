import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '영화의 제목',
    example: '겨울 왕국',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '영화의 상세내용',
    example: '3시간 금방갑니다.',
  })
  detail: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '감독 객체 ID',
    example: '1',
  })
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({
    description: '장르 IDS',
    example: [1, 2, 3],
  })
  genreIds: number[];

  @IsString()
  @ApiProperty({
    description: '영화 파일 이름',
    example: 'aaa-bbb-ccc-ddd.jpg',
  })
  movieFileName: string;
}

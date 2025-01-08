import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  // ex) id_52,likeCount_20
  @IsString()
  @IsOptional()
  cursor?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  order?: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  take: number = 5;
}

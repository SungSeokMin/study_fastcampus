import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDirectorDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsDateString()
  dob?: Date;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nationality?: string;
}

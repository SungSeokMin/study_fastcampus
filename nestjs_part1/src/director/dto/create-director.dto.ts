import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  nationality: string;
}

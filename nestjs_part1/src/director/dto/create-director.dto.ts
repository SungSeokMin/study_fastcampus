import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsDate()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  nationality: string;
}

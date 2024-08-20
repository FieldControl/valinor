import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;
}

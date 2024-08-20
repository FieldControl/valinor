import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty()
  title: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ required: true, nullable: true })
  title: string;

  @ApiProperty({ required: true, nullable: true })
  description: string;

  @ApiProperty({ required: true, nullable: false })
  columnId: string;
}

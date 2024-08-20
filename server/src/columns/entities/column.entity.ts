import { Column } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ColumnEntity implements Column {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: true, nullable: true })
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

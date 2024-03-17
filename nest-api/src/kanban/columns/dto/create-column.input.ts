import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateColumnInput {
  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  title: string;
}

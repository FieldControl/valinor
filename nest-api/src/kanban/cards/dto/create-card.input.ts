import { InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCardInput {
  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  column: string;

  @IsString()
  @IsNotEmpty({ message: 'Invalid characters' })
  user: string;
}

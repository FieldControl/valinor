import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

        export class CreateCardDto {
          @IsString()
          @IsNotEmpty()
          title: string;

          @IsString()
          @IsOptional()
          description?: string;

          @IsNumber()
          @IsNotEmpty()
          columnId: number;
        }
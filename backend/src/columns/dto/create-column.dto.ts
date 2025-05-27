import { IsString, IsOptional, IsNumber, IsNotEmpty } from "class-validator"

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsNumber()
  order?: number
} 
import {IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  columnId: string

  @IsNumber()
  @IsOptional()
  order?: number
}
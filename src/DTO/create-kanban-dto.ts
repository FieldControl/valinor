import { IsNotEmpty, MaxLength } from "class-validator";

export class CreateKanbanDto {
  @IsNotEmpty()
  @MaxLength(15, {message: 'Max length is 15 characters.'})
  title: string;
  @IsNotEmpty()
  description: string;
}
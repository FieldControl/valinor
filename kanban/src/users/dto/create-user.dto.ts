import { IsNotEmpty, isNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    password: string;
}

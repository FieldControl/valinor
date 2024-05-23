import { Types } from "mongoose";

export class CreateUserDto {
    _id: Types.ObjectId
    name: string;
    email: string;
    password: string;
    creation: Date;
}

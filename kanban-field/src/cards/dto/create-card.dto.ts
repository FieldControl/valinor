import { User } from "src/users/entities/user.entity";

export class CreateCardDto {
    name: string
    description: string
    createdAt: Date
    dueDate: Date
    responsibles: User[]
    column: string
}

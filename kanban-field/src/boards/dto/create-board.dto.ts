import { Column } from "src/columns/entities/column.entity";
import { User } from "src/users/entities/user.entity";

export class CreateBoardDto {
    name: string;
    columns: Column[];
    responsible: User
}
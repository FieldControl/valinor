import { Column } from "src/columns/entities/column.entity";

export class CreateBoardDto {
    name: string
    columns: Column[]
    responsibles: string[]
}
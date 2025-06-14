import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { IColumn } from "../DTO/column.dto";

@Injectable({
    providedIn: "root"
})
export class ColumnService {
    http = inject(HttpClient);

    getByBoardId(boardId: number) {
        return this.http.get<IColumn[]>(`http://localhost:3000/boards/${boardId}/columns`);
    }
}



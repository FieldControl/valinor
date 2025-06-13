import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { IBoard, IBoardCreate, IBoardUpdate } from "../DTO/board.dto";

@Injectable({
    providedIn: "root"
})

export class BoardService {
    http = inject(HttpClient);

    getAll() {
        return this.http.get<IBoard[]>("http://localhost:3000/boards");
    }

    post(board: IBoardCreate) {
        return this.http.post("http://localhost:3000/boards", board);
    }

    patch(board: IBoardUpdate) {
        return this.http.patch(`http://localhost:3000/boards/${board.id}`, board);
    }
}
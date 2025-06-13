import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { IBoardCreate } from "../DTO/board.dto";

@Injectable({
    providedIn: "root"
})

export class BoardService {
    http = inject(HttpClient);
    
    post(board: IBoardCreate) {
        return this.http.post("http://localhost:3000/boards", board);
    }
}
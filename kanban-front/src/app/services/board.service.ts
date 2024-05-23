import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IBoard, ICreateBoard } from "../models/board";

@Injectable({
    providedIn: 'root',
})

export class BoardService extends DefaultService {
    constructor(private http: HttpClient) {
        super('boards');
    }

    list(): Observable<IBoard[]> {
        return this.http.get<IBoard[]>(this.url)
    }

    findById(id: string): Observable<IBoard> {
        return this.http.get<IBoard>(`${this.url}/${id}`)
    }

    create(board: ICreateBoard): Observable<IBoard> {
        return this.http.post<IBoard>(this.url, board)
    }

    createByMail(board: ICreateBoard): Observable<IBoard> {
        return this.http.post<IBoard>(`${this.url}/create-by-email`, board)
    }

    edit(boardId: string, board: ICreateBoard): Observable<IBoard> {
        return this.http.patch<IBoard>(`${this.url}/${boardId}`, board)
    }

    editByMail(boardId: string, board: ICreateBoard): Observable<IBoard> {
        return this.http.patch<IBoard>(`${this.url}/${boardId}/update-by-email`, board)
    }

    delete(id: String): Observable<IBoard> {
        return this.http.delete<IBoard>(`${this.url}/${id}`)
    }
}
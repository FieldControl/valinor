import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IBoard } from "../models/board";

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

    create(board: IBoard): Observable<IBoard> {
        return this.http.post<IBoard>(this.url, board)
    }

    edit(board: IBoard): Observable<IBoard> {
        return this.http.put<IBoard>(`${this.url}/${board._id}`, board)
    }

    delete(id: String): Observable<IBoard> {
        return this.http.delete<IBoard>(`${this.url}/${id}`)
    }
}
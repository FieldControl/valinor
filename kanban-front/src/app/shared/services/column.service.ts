import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IColumn, ICreateColumn } from "../../core/models/column";

@Injectable({
    providedIn: 'root',
})

export class ColumnService extends DefaultService {
    constructor(private http: HttpClient) {
        super('columns');
    }

    list(): Observable<IColumn[]> {
        return this.http.get<IColumn[]>(this.url)
    }

    findById(id: string): Observable<IColumn> {
        return this.http.get<IColumn>(`${this.url}/${id}`)
    }

    findByBoard(boardId: string): Observable<IColumn[]> {
        return this.http.get<IColumn[]>(`${this.url}/boards/${boardId}`);
    }

    create(column: ICreateColumn): Observable<IColumn> {
        return this.http.post<IColumn>(this.url, column)
    }

    edit(columnId: string, column: ICreateColumn): Observable<IColumn> {
        return this.http.patch<IColumn>(`${this.url}/${columnId}`, column)
    }

    delete(id: String): Observable<IColumn> {
        return this.http.delete<IColumn>(`${this.url}/${id}`)
    }
}
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

//Bloco que define a estrutura dos dados que vamos buscar
interface Column {
  id: string;
  title: string;
}

interface GetColumnsResponse {
  getColumns: Column[]; //Nome da query deve bater com a API GraphQL do backend
}

@Injectable({
  providedIn: 'root', // Disponível globalmente na aplicação
})
export class KanbanService {
  constructor(private apollo: Apollo) {}

  /*
   Busca todas as colunas do Kanban no backend GraphQL e
   retorna um Observable apenas com os dados das colunas
  */
  getColumns(): Observable<Column[]> {
    return this.apollo.query<GetColumnsResponse>({
      query: gql`
        query {
          getColumns {
            id
            title
          }
        }
      `,
    }).pipe(
      map(result => result.data.getColumns) // Extraímos apenas os dados
    );
  }
}

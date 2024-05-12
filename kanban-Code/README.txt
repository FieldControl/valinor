OBS: A API ficou pronta e o front-end também, porém o acesso entre eles não foi implementado.

O objetivo do projeto era montar um Kanban com 4 colunas.

O projeto ficou organizado da seguinte forma: dentro da pasta ‘projeto-kanban’ existem duas pastas, ‘kanban-api’, onde fica o back-end, e ‘kanban-front-end’, onde fica o front-end.

#Back-End
A API foi desenvolvida utilizando Nest.js e está no formato SQLite, contendo 3 tabelas

export class Task {
    text: string;
    id: number;
    columnId:number;

  }
  
  export class Columns {
    id: number;
    name: string;
    tasks: Task[];
    boardId:number;
  }
  
  export class CreateBoards {
    id: number;
    name: string;
    columns: Columns[];
  }


Para iniciar o servidor, é necessário utilizar o comando 'npm run start:dev' no terminal integrado, no diretório '…\Kanban\project-kanban\kanban-api';

Para visualizar as tabelas, você pode acessar através do localhost 'http://localhost:3000', seguido de ‘/board’, '/column' ou '/task'. Alternativamente, você pode usar o Prisma com o comando 'npx prisma studio' no terminal, localizado em '…\Kanban\project-kanban\kanban-api\src\prisma'.

Os testes da Api foram feitas através do programa Insomnia.

#Front-End

Para compilar e abrir o projeto, é necessário utilizar o comando 'ng serve' no terminal, localizado em '…\Kanban\project-kanban\kanban-front-end'. Após a compilação, a porta onde o servidor está rodando será exibida.


# API do Kanban

## Sobre

Esta API é utilizada para gerenciar um sistema de Kanban, permitindo operações CRUD em tarefas, colunas e quadros.

#### Estrutura de uma Tarefa

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "createdAt": "string",
  "updatedAt": "DateTime",
  "columnId": "string"
}
```

#### Operações

- `GET /task` - Retorna todas as tarefas.
- `GET /task/:id` - Retorna uma tarefa pelo ID.
- `POST /task` - Cria uma nova tarefa.
- `PATCH /task` - Atualiza propriedades de uma tarefa existente.
- `DELETE /task` - Deleta uma tarefa.

### Colunas

#### Estrutura de uma Coluna

```json
{
  "id": "string",
  "title": "string",
  "createdAt": "string",
  "boardId": "string",
  "tasks": ["Task"]
}
```

#### Operações

- `GET /column` - Retorna todas as colunas.
- `GET /column/:id` - Retorna uma coluna pelo ID.
- `POST /column` - Cria uma nova coluna.
- `PATCH /column` - Atualiza propriedades de uma coluna existente.
- `DELETE /column` - Deleta uma coluna.

### Quadros

#### Estrutura de um Quadro

```json
{
  "id": "string",
  "title": "string",
  "createdAt": "string",
  "columns": ["Column"]
}
```

#### Operações

- `GET /board` - Retorna todos os quadros.
- `GET /board/:id` - Retorna um quadro pelo ID.
- `POST /board` - Cria um novo quadro.
- `PATCH /board` - Atualiza propriedades de um quadro existente.
- `DELETE /board` - Deleta um quadro.

# Kanban API Documentation

Esta é a documentação da API do Kanban desenvolvida usando NestJS, Prisma e PostgreSQL, utilizando GraphQL.

## Sumário

1. [Instalação](#instalação)
2. [Autenticação](#autenticação)
3. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
4. [Gerenciamento de Projetos](#gerenciamento-de-projetos)
5. [Gerenciamento de Colunas](#gerenciamento-de-colunas)
6. [Gerenciamento de Tarefas](#gerenciamento-de-tarefas)
7. [Tratamento de Erros](#tratamento-de-erros)

## 1- Instalação

Para instalar as dependências do projeto, execute:

```bash
npm install
```

Certifique-se de configurar suas variáveis de ambiente corretamente, incluindo detalhes do banco de dados PostgreSQL.

## 2- Autenticação

#### Login de Usuário

Rota: loginUser

Tipo: Mutation

Descrição: Autentica um usuário e retorna um token de acesso e os dados do usuário.

Exemplo de Uso:

```json
mutation {
  loginUser(loginUserInput: { email: "usuario@example.com", password: "senha123" }) {
    access_token
    user {
      id
      email
      name
    }
  }
}
```

Throttling
Para proteger a API contra abuso, as requisições de login são limitadas a 10 tentativas por minuto.

## 3- Gerenciamento de Usuários

#### Criar Usuário

Rota: createUser

Tipo: Mutation

Descrição: Cria um novo usuário.

Exemplo de Uso:

```json
mutation {
  createUser(createUserInput: { email: "novo@usuario.com", password: "senha123", name: "Novo Usuário" }) {
    id
    email
    name
  }
}
```

#### Buscar Todos os Usuários

Rota: users

Tipo: Query

Descrição: Retorna todos os usuários.

Exemplo de Uso:

```json
query {
  users {
    id
    email
    name
  }
}
```

#### Atualizar Usuário

Rota: updateUser

Tipo: Mutation

Descrição: Atualiza um usuário existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  updateUser(updateUserInput: { id: "usuarioId", email: "atualizado@usuario.com", name: "Usuário Atualizado" }) {
    id
    email
    name
  }
}
```

#### Remover Usuário

Rota: removeUser

Tipo: Mutation

Descrição: Remove um usuário existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  removeUser(id: "usuarioId") {
    id
    email
  }
}
```

## 4- Gerenciamento de Projetos

#### Criar Projeto

Rota: createProject

Tipo: Mutation

Descrição: Cria um novo projeto. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  createProject(createProjectInput: { name: "Novo Projeto" }) {
    id
    name
  }
}
```

#### Buscar Todos os Projetos

Rota: projects

Tipo: Query

Descrição: Retorna todos os projetos.

Exemplo de Uso:

```json
query {
  projects {
    id
    name
  }
}
```

#### Atualizar Projeto

Rota: updateProject

Tipo: Mutation

Descrição: Atualiza um projeto existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  updateProject(updateProjectInput: { id: "projetoId", name: "Projeto Atualizado" }) {
    id
    name
  }
}
```

#### Remover Projeto

Rota: removeProject

Tipo: Mutation

Descrição: Remove um projeto existente. Requer autenticação.

Exemplo de Uso:

```json

mutation {
  removeProject(id: "projetoId") {
    id
    name
  }
}
```

## 5- Gerenciamento de Colunas

#### Criar Coluna

Rota: createColumn

Tipo: Mutation

Descrição: Cria uma nova coluna no projeto. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  createColumn(createColumnInput: { name: "Nova Coluna", projectId: "projetoId" }) {
    id
    name
    projectId
  }
}
```

#### Buscar Todas as Colunas

Rota: columns

Tipo: Query

Descrição: Retorna todas as colunas.

Exemplo de Uso:

```json
query {
  columns {
    id
    name
    projectId
  }
}
```

#### Atualizar Coluna

Rota: updateColumn

Tipo: Mutation

Descrição: Atualiza uma coluna existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  updateColumn(updateColumnInput: { id: "colunaId", name: "Coluna Atualizada" }) {
    id
    name
    projectId
  }
}
```

Remover Coluna
Rota: removeColumn

Tipo: Mutation

Descrição: Remove uma coluna existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  removeColumn(id: "colunaId") {
    id
    name
  }
}
```

## 6- Gerenciamento de Tarefas

#### Criar Tarefa

Rota: createTask

Tipo: Mutation

Descrição: Cria uma nova tarefa. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  createTask(createTaskInput: { title: "Nova Tarefa", columnId: "colunaId" }) {
    id
    title
    columnId
  }
}
```

#### Buscar Todas as Tarefas

Rota: tasks

Tipo: Query

Descrição: Retorna todas as tarefas.

Exemplo de Uso:

```json
query {
  tasks {
    id
    title
    columnId
  }
}
```

#### Atualizar Tarefa

Rota: updateTask

Tipo: Mutation

Descrição: Atualiza uma tarefa existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  updateTask(updateTaskInput: { id: "tarefaId", title: "Tarefa Atualizada" }) {
    id
    title
    columnId
  }
}
```

#### Remover Tarefa

Rota: removeTask

Tipo: Mutation

Descrição: Remove uma tarefa existente. Requer autenticação.

Exemplo de Uso:

```json
mutation {
  removeTask(id: "tarefaId") {
    id
    title
  }
}

```

## 7- Tratamento de Erros

A API está equipada para lidar com vários erros, como autenticação e autorização, erros de validação e erros gerais do servidor.

#### Erros Comuns

- 401 Unauthorized: Quando a autenticação é necessária mas não fornecida ou inválida.
- 403 Forbidden: Quando o usuário não tem permissão para acessar o recurso.
- 400 Bad Request: Quando os dados fornecidos são inválidos ou estão faltando.
- 500 Internal Server Error: Quando ocorre um erro inesperado no servidor.

Exemplo de Erro de Autenticação:

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createColumn"],
      "extensions": {
        "code": "UNAUTHENTICATED",
        "exception": {
          "stacktrace": [
            "Error: Unauthorized",
            "    at AuthGuard.canActivate (src/auth/auth.guard.ts:22:13)"
          ]
        }
      }
    }
  ],
  "data": null
}
```

# Kanban - Desafio Field Control

Este projeto consiste em um Kanban básico, desenvolvido como parte do desafio técnico da Field Control. Ele permite a criação de colunas e cards, seguindo boas práticas de desenvolvimento, incluindo testes unitários e integração.

## Tecnologias Utilizadas

- Frontend: Angular, Apollo Client (GraphQL)

- Backend: NestJS, GraphQL, PostgreSQL (via Prisma ORM)

- Infraestrutura: Railway (Backend e Banco de Dados), Vercel (Frontend)

- Testes: Jest (testes unitários e de integração)

## 🛠 Como Executar o Projeto

Pré-requisitos:

Antes de iniciar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/pt)
- NestJS: Instale via npm
- Angular: Instale via npm

Após instalar o Node.js, execute os seguintes comandos para garantir que o ambiente de desenvolvimento esteja configurado:

```bash
# Comando para baixar o Nextjs
npm install -g @nestjs/cli

# Verifique se foi instalado:
nest --version


# Comando para baixar o Angular
npm install -g @angular/cli

#Verifique se foi Instalado:
ng version
```

## Clone o repositório

Clone o repositório para a sua máquina:

```bash
# Clone o repositorio
git clone https://github.com/DevSamuelBrito/valinor.git
```

Após clonar abra o terminal na pasta do projeto.

## Backend

1. Crie um arquivo .env dentro da pasta backend e adicione a seguinte variável:

```bash
DATABASE_URL="postgresql://postgres:RawFIhAkZQELkORRZBjNUMQrxaHiDlWa@metro.proxy.rlwy.net:19350/railway"
```

2. Acesse a pasta do backend e instale as dependências:

```bash
# Caso não esteja dentro da pasta do backend de o seguinte comando:
cd backend

# Instale as dependências
npm install

# Inicie o servidor
npm run start:dev
```

O backend estará rodando em http://localhost:3000/graphql

Para rodar os testes unitários e de integração, use o seguinte comando:

```bash
# Rodar os testes
npm run test
```

Caso ele não apareça seleciona "a" para rodar todos os testes.

## Frontend

```bash
# Acesse a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação
ng serve
```

O frontend estará disponível em http://localhost:4200

## Tutorial Kanban:

Para verificar o sistema funcionando acesse:
https://valinor-nine.vercel.app/

### Como usar?

1. Clique no botão para Criar Coluna. A nova coluna aparecerá na parte inferior da tela.
2. Depois de criar a coluna, você pode:
   - Editar o nome da coluna.
   - Criar um Card dentro dela.
   - Excluir a coluna.
3. Com um Card criado, você pode:
   - Editar o nome do card.
   - Editar a descrição do card.
   - Excluir o card.

# Endpoints

## 1. Colunas: 
  - Pegar todas as Colunas: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint retorna todas as colunas cadastradas no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {"query": "query { getColumns { id title } }"}
      ```

    - Exemplo de resposta:
     ```bash
    
      "data": {
        "getColumns": [
          {
            "id": 2,
            "title": "Doing"
          },
          {
            "id": 7,
            "title": "Done"
          },
          {
            "id": 9,
            "title": "Extra Video 2"
          }
        ]
      }
    ```

    ---

  - Criar uma Coluna: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint cria uma coluna no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {
        "query": "mutation($title: String!) { createColumn(title: $title) { id title } }",
        "variables": {
          "title": "Nova Coluna"
        }
      }

      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "createColumn": {
            "id": 10,
            "title": "Nova Coluna"
          }
        }
      }
    ```
    --- 
  - Editar o nome de uma Coluna: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint atualiza o nome uma coluna no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {
        "query": "mutation UpdateColumn($id: Float!, $title: String!) { updateColumn(id: $id, title: $title) { id title } }",
        "variables": {
          "id": 2,
          "title": "New Column Title"
        }
      }


      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "updateColumn": {
            "id": 2,
            "title": "New Column Title"
          }
        }
      }
    ```
    ---

  - Excluir uma Coluna: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint deleta uma coluna no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
     {
        "query": "mutation DeleteColumn($id: Float!) { deleteColumn(id: $id) { id title } }",
        "variables": {
          "id": 2
        }
     }
      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "deleteColumn": {
            "id": 2,
            "title": "New Column Title"
          }
        }
      }
    ```
    ---

  - Criar um Card: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint cria um card em uma coluna selecionada no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {
        "query": "mutation CreateCard($columnId: Float!, $title: String!, $description: String!) { createCard(columnId: $columnId, title: $title, description: $description) { id title description columnId } }",
        "variables": {
          "columnId": 9,
          "title": "New Card",
          "description": "This is a description for the new card."
        }
      }
      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "createCard": {
            "id": 10,
            "title": "New Card",
            "description": "This is a description for the new card.",
            "columnId": 9
          }
        }
      }
    ```
    ---

  - Editar um Card: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint edita o nome e a descrição de um card no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {
        "query": "mutation UpdateCard($cardId: Float!, $title: String!, $description: String!) { updateCard(cardId: $cardId, title: $title, description: $description) { id title description columnId } }",
        "variables": {
          "cardId": 9,
          "title": "Updated Card Title",
          "description": "Updated description for the card."
        }
      }

      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "updateCard": {
            "id": 9,
            "title": "Updated Card Title",
            "description": "Updated description for the card.",
            "columnId": 9
          }
        }
      }
    ```
    ---
  - Excluir um Card: 
  - URL:  https://valinor-production.up.railway.app/graphql
  - Descrição: Este endpoint deleta um card no Kanban.
  - Metodo POST
  - Request Body (JSON):

      ```bash
      {
        "query": "mutation DeleteCard($cardId: Float!) { deleteCard(cardId: $cardId) { id } }",
        "variables": {
          "cardId": 9
        }
      }


      ```

    - Exemplo de resposta:
     ```bash
      {
        "data": {
          "deleteCard": {
            "id": 9
          }
        }
      }
    ```
    ---

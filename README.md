# **Kanban App**

Este é um projeto de Kanban desenvolvido utilizando **Angular** para o frontend e **NestJS** para o backend, com **GraphQL** para comunicação entre eles. Ele permite a criação, movimentação e exclusão de tarefas em colunas como "Em Processo" e "Finalizado".

---

## **Estrutura do projeto**

O projeto é dividido em duas pastas principais:

- `kanban-frontend/`: Contém o código do frontend desenvolvido em Angular.
- `kanban-backend/`: Contém o código do backend desenvolvido em NestJS.

---

## **Como executar o projeto**

### 1. **Clone o repositório**

```bash
git clone https://github.com/vitordcode/valinor
cd valinor
```

---

### 2. **Instale as dependências**

##### Frontend:
```bash
cd kanban-frontend
npm install
```

##### Backend:
```bash
cd kanban-backend
npm install
```

---

### 3. **Execute o projeto**

##### Frontend:

No diretório kanban-frontend/, execute:
```bash
npm start
```
O frontend será inciado em http://localhost:4200.

##### Backend:

No diretório kanban-backend/, execute:
```bash
npm start
```
O backend será iniciado em http://localhost:3000/graphql.

---


### 4. **Rodando os testes**

##### Frontend

No diretório kanban-frontend/, execute:
```bash
npm test
```
Isso iniciará os testes unitários utilizando Karma e Jasmine.

##### Backend

No diretório kanban-backend/, execute:
```bash
npm test
```
Isso iniciará os testes unitários e de integração utilizando Jest.
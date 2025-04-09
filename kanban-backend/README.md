# 🧠 Kanban Backend

Este é o backend do sistema **Kanban**, responsável por gerenciar os dados da aplicação utilizando **NestJS**, **GraphQL** e **WebSockets (Socket.IO)** para comunicação em tempo real.

---

## 🚀 Tecnologias utilizadas

### 🛠️ Frameworks e Ferramentas
- **NestJS** – Framework Node.js para construção do backend  
- **Docker & Docker Compose** – Para facilitar o ambiente de desenvolvimento e deploy

### 🔗 API e Comunicação
- **GraphQL** – Para APIs mais eficientes e flexíveis  
- **Apollo Server** – Integração entre NestJS e GraphQL  
- **Socket.IO** – Comunicação em tempo real via WebSocket

### 🗄️ Banco de Dados
- **PostgreSQL** – Banco de dados relacional  
- **TypeORM** – ORM para gerenciar entidades, migrations e conexões com o banco

### 🧹 Qualidade de Código
- **ESLint** – Padronização e limpeza do código

### 🧪 Testes
- **Jest** – Testes unitários, integrados e end-to-end (e2e)

---

## ⚙️ Requisitos

- [Node.js 18+](https://nodejs.org/en/download)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [npm (incluso com Node.js)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- (Opcional) [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/install/)

---

## 📦 Instalação

Clone o projeto:

```bash
git clone https://github.com/matheuscervantes/MatheusKanban.git
cd MatheusKanban/kanban-backend
```

Instale as dependências:

```bash
npm install
```

---

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=db         # Use 'db' se estiver rodando com Docker
# DB_HOST=localhost  # Use 'localhost' se estiver rodando o banco localmente

DB_PORT=5432
DB_USERNAME=seu_usuario_postgres
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
```

> 💡 Se estiver usando **Docker Compose**, deixe `DB_HOST=db` como está — o nome do serviço do banco de dados é `db`.

---

## 🐘 Banco de Dados

Crie um banco no PostgreSQL com o nome configurado em `DB_NAME`.

Execute as migrations para preparar as tabelas:

```bash
npm run migration:run
```

---

## ▶️ Rodando a aplicação

```bash
npm run start
```

A aplicação será executada em `http://localhost:3000`.

> 🔒 **Atenção:** Por questões de segurança, o **GraphQL Playground** está desabilitado. As queries devem ser feitas via cliente frontend ou ferramentas autorizadas.

---

## 🐳 Rodando com Docker

Para rodar a aplicação com **Docker Compose**, esteja na **raiz do repositório** (`MatheusKanban`) e execute:

```bash
docker-compose --env-file ./kanban-backend/.env up -d
```

Isso iniciará:

- O **backend** em  
  [http://localhost:3000](http://localhost:3000)

- O **frontend** em  
  [http://localhost:4200](http://localhost:4200)

> O banco de dados estará acessível no host `db` (conforme definido no `.env`).

---

## 📡 Comunicação em tempo real

A aplicação utiliza **Socket.IO** para atualizações simultâneas. Sempre que um card é alterado por um usuário, todos os outros conectados recebem essa alteração em tempo real.

---

## 🧪 Testes

A aplicação conta com testes **unitários**, **integrados** e **end-to-end (e2e)** utilizando o **Jest**, garantindo estabilidade e confiabilidade do sistema.

### Executar os testes:

- Testes unitários e integrados:

```bash
npm run test
```

- Testes e2e:

```bash
npm run test:e2e
```

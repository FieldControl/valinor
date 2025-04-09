# 🎨 Kanban Frontend

Este é o frontend do sistema **Kanban**, construído com **Ionic** e **Angular**. Ele se conecta ao backend via **GraphQL (Apollo Angular)** e utiliza **CDK** para movimentação dos cards no estilo *drag and drop*, com atualizações em tempo real através de **Socket.IO**.

---

## 🚀 Tecnologias utilizadas

### 🛠️ Frameworks e Ferramentas
- **Ionic com Angular** – Para construção de uma interface moderna, responsiva e mobile-friendly  
- **CDK (Component Dev Kit)** – Utilizado para movimentação de colunas e cards com *drag and drop*

### 🔗 API e Comunicação
- **GraphQL** – Comunicação eficiente com o backend  
- **Apollo Angular** – Cliente GraphQL para Angular  
- **Socket.IO Client** – Para atualizações em tempo real entre os usuários

### 🎨 UI e Estilo
- **Ionicons** – Ícones nativos do Ionic para enriquecer a interface  

### 🧹 Qualidade de Código
- **ESLint** – Garantia de um código limpo, padronizado e confiável

---

## ⚙️ Requisitos

- [Node.js 18+](https://nodejs.org/en/download)  
- [npm (incluso com Node.js)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

> ⚠️ **Importante:** Para o funcionamento completo do frontend, é imprescindível que o **servidor backend esteja em execução**. Ele é responsável por processar as requisições e interagir com o banco de dados, sendo essencial para o carregamento e persistência das informações exibidas na interface.

---

## 📦 Instalação

Clone o projeto:

```bash
git clone https://github.com/matheuscervantes/MatheusKanban.git
cd MatheusKanban/kanban-frontend
```

Instale as dependências:

```bash
npm install
```

---

## 🔧 Configuração

Antes de iniciar a aplicação, verifique o arquivo de ambiente com as URLs do backend:

```ts
// kanban-frontend/src/environments/environment.ts

export const environment = {
  production: true,
  graphqlUri: 'http://localhost:3000/graphql',
  socketUrl: 'http://localhost:3000'
};
```

> ✅ Altere os valores de `graphqlUri` e `socketUrl` conforme o IP ou domínio onde o backend está rodando.

---

## ▶️ Rodando a aplicação

Execute o seguinte comando:

```bash
npm run start
```

A aplicação será iniciada em:  
[http://localhost:4200](http://localhost:4200)

---

## 🐳 Rodando com Docker

Para subir toda a aplicação (frontend + backend + banco de dados) via **Docker Compose**, vá até a **raiz do repositório** (`MatheusKanban`) e execute:

```bash
docker-compose --env-file ./kanban-backend/.env up -d
```

Isso irá iniciar:

- O **backend** em  
  [http://localhost:3000](http://localhost:3000)

- O **frontend** em  
  [http://localhost:4200](http://localhost:4200)

> 📄 Certifique-se de que o arquivo `.env` localizado em `kanban-backend` esteja devidamente configurado. O modelo de configuração pode ser consultado no [README do backend](../kanban-backend/README.md).

---

## 📡 Comunicação em tempo real

O frontend utiliza **Socket.IO** para garantir sincronização em tempo real entre os usuários. Toda vez que um card é criado, movido ou atualizado, as mudanças são imediatamente refletidas para todos os usuários conectados.
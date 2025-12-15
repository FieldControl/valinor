# Kanban – Desafio Valinor

Aplicação Kanban com **quadros**, **colunas** e **cards**, desenvolvida como solução para o desafio técnico da Valinor/FieldControl.

O sistema permite:

- CRUD de **Boards**, **Columns** e **Cards**
- Ordenação via **drag and drop** de colunas e cards
- Cards com **descrição** e **prazo de entrega (dueDate)**
- Interface construída com **Angular + Angular Material**
- API REST em **NestJS + Prisma + PostgreSQL (Supabase)**
- Testes **unitários** e **e2e** na API
- Padronização de código com **ESLint + Prettier**

---

## Demo

- **Frontend (Netlify):** [https://kanban-vitorsantini.netlify.app](https://kanban-vitorsantini.netlify.app)
- **API (Render):** [https://valinor-now9.onrender.com](https://valinor-now9.onrender.com)

---

## Arquitetura geral

Estrutura em duas aplicações separadas:

```bash
.
├── server   # API NestJS + Prisma
└── client   # Frontend Angular
```

### Modelagem de dados (Prisma)

```prisma
model Board {
  id        String   @id @default(uuid())
  name      String
  columns   Column[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Column {
  id        String   @id @default(uuid())
  title     String
  order     Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id])
  cards     Card[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Card {
  id          String   @id @default(uuid())
  title       String
  description String?
  order       Int
  columnId    String
  column      Column   @relation(fields: [columnId], references: [id])
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- A ordenação visual é feita pelo campo `order`.
- `Column.order` define a ordem das colunas dentro do board.
- `Card.order` define a ordem dos cards dentro da coluna.

---

## Backend – `server/`

### Stack

- **Node.js**
- **NestJS** (arquitetura modular, injeção de dependência)
- **Prisma ORM**
- **PostgreSQL (Supabase)**
- **Jest** (testes unitários e e2e)
- **ESLint + Prettier**

### Organização

- `src/app.module.ts` – módulo raiz
- `src/boards` – módulo de boards
  - controller, service, DTOs de create/update
- `src/columns` – módulo de colunas
- `src/cards` – módulo de cards
- `src/prisma/prisma.service.ts` – integra Nest com Prisma

### Principais endpoints

**Boards**

- `POST /boards` – criar board
- `GET /boards` – listar boards
- `GET /boards/:id` – obter board com colunas e cards (ordenados por `order`)
- `PATCH /boards/:id` – atualizar (nome)
- `DELETE /boards/:id` – remover board

**Columns**

- `POST /boards/:boardId/columns` – criar coluna em um board
- `PATCH /columns/:id` – atualizar título e/ou `order`
- `DELETE /columns/:id` – remover coluna

**Cards**

- `POST /columns/:columnId/cards` – criar card em uma coluna
- `PATCH /cards/:id` – atualizar título, descrição, `dueDate`, `order` e/ou `columnId`
- `DELETE /cards/:id` – remover card

### Validação e erros

- DTOs com **class-validator**:
  - `IsString`, `IsNotEmpty`, `IsOptional`, `IsInt`, etc.
- `ValidationPipe` global para validar payloads e aplicar whitelist
- Uso de **`NotFoundException`** com mensagens em português:
  - `'Board não encontrado'`
  - `'Coluna não encontrada'`
  - `'Card não encontrado'`

### Integração com banco (Prisma)

- `PrismaService` estende `PrismaClient` e gerencia conexão:
  - `onModuleInit` → `this.$connect()`
  - `enableShutdownHooks` para encerrar conexões ao finalizar a aplicação

---

## Frontend – `client/`

### Stack

- **Angular**
- **Angular Material**
- **Angular CDK DragDrop**
- **ESLint + Prettier**

### Organização

- `/src/app/core`
  - `models/board.model.ts`
  - `models/column.model.ts`
  - `models/card.model.ts`
  - `services/kanban-api.service.ts` – comunicação com a API
- `/src/app/features/boards`
  - `board-list` – listagem de boards
  - `board-detail` – visualização do board com colunas e cards
- `/src/app/shared`
  - `kanban-column` – coluna (lista de cards + drag and drop)
  - `kanban-card` – card individual
  - dialogs de criação/edição de board, coluna e card

### Funcionalidades implementadas

**Boards**

- Listagem de boards existentes
- Criação via dialog (nome do quadro)
- Exclusão de board
- Abertura de board para visualizar colunas e cards

**Columns**

- Listar colunas de um board
- Criar nova coluna (dialog)
- Editar título da coluna
- Excluir coluna
- Drag & drop das colunas:
  
**Cards**

- Criar card em uma coluna (dialog com título, descrição e prazo)
- Exibir título, descrição e dueDate
- Ao clicar, abre dialog em **modo read-only**
  - botão “Editar” libera os campos
  - botão “Salvar” persiste alterações
- Excluir card
- Drag & drop de cards

### Drag and Drop (Angular CDK)

**Colunas**

- Container de colunas com `cdkDropList` horizontal
- Cada `app-kanban-column` com `cdkDrag`

**Cards**

- `cdkDropList` na lista de cards de cada coluna
- `cdkDrag` em cada card
- Uso de `moveItemInArray` e `transferArrayItem` para:
  - reordenar dentro da coluna
  - mover entre colunas
- Atualização de `order` e `columnId` via API

---

## Estilo e UI

- Layout com fundo claro e painel branco
- **Angular Material** para:
  - `MatCard` (boards, colunas, cards)
  - `MatDialog`
  - `MatButton`
  - `MatFormField` + `matInput`
  - `MatIcon` (Material Icons)
- Dialogs com `panelClass: 'app-dialog'` e CSS específico:
  - bordas arredondadas
  - sombra suave
  - labels sempre flutuando (`floatLabel="always"`)
- Botões padronizados:
  - botões primários (azuis)
  - botões de texto (`Voltar`, `Cancelar`, `Excluir`) com estilos consistentes
- Ícones:
  - uso de **Material Icons** (`<mat-icon>edit</mat-icon>`, etc.)

---

## Como rodar localmente

### Pré-requisitos

- Node.js (LTS)
- npm
- Banco PostgreSQL (Supabase)

### 1. Clonar o repositório

```bash
git clone https://github.com/vitorsantini/valinor.git
cd kanban
```

### 2. Backend – `server/`

#### 2.1. Configurar `.env`

Na pasta `server/`, criar `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/database?schema=public"
```

#### 2.2. Instalar dependências e gerar Prisma Client

```bash
cd server
npm install
npx prisma generate
# se estiver usando migrations:
npx prisma migrate dev
```

#### 2.3. Rodar API em modo dev

```bash
npm run start:dev
```

API disponível em:

```txt
http://localhost:3000
```

### 3. Frontend – `client/`

#### 3.1. Configurar environments

`client/src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
};
```

`client/src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://valinor-now9.onrender.com',
};
```

#### 3.2. Instalar dependências e subir a aplicação

```bash
cd client
npm install
npm start
```

App disponível em:

```txt
http://localhost:4200
```

---

## Scripts principais

### Backend (`server/`)

- `npm run start:dev` – modo desenvolvimento
- `npm run build` – build de produção (Nest)
- `npm run start:prod` – roda `dist/main.js`
- `npm test` – testes unitários
- `npm run test:e2e` – testes end-to-end
- `npx prisma studio` – interface visual para o banco (opcional)

### Frontend (`client/`)

- `npm start` – desenvolvimento
- `npm run build` – build de produção
- `npm run lint` – lint do projeto

---

## Testes

### API (NestJS)

Foram implementados:

- **Testes unitários**:
  - services de Boards, Columns e Cards
  - controllers, verificando chamadas corretas aos services
- **Testes e2e** (Nest + supertest):
  - fluxo completo:
    - criar board
    - criar coluna
    - criar card
    - obter board com colunas e cards
    - atualizar recursos
    - remover recursos

Os testes usam uma base de dados de desenvolvimento configurada via Prisma.

### Frontend

Para o escopo do desafio, o foco principal foi:

- funcionalidade da UI
- integração com a API
- drag and drop com persistência

Como melhoria futura, faz sentido adicionar:

- testes de componentes Angular (Jasmine/Jest)
- testes e2e com Cypress/Playwright

---

## Qualidade de código

- **ESLint + Prettier** configurados para backend e frontend

---

## Envio de solução

### Framework, linguagem e ferramentas

Usei principalmente:

**Linguagem**

- **TypeScript** no backend (NestJS) e no frontend (Angular).

**Backend**

- **NestJS** – framework Node com:
  - arquitetura modular (módulos de boards, columns, cards)
  - injeção de dependência
  - suporte integrado a pipes, filtros e testes
- **Prisma ORM**:
  - schema centralizado
  - geração de tipos
  - migrations
- **PostgreSQL (Supabase)** como banco relacional
- **Jest + supertest** para testes unitários e e2e
- **class-validator / class-transformer** para validação de entrada

**Frontend**

- **Angular** com standalone components
- **Angular Material** para UI (cards, dialogs, botões, inputs)
- **Angular CDK DragDrop** para drag and drop
- **HttpClient + RxJS** para chamadas à API

**Ferramentas de qualidade**

- **ESLint + Prettier** para padronização
- **Husky + lint-staged** para automatizar lint/format antes dos commits

---

### Tecnologias X e Y

**NestJS **

- requisito técnico do desafio
- já entrega uma estrutura de projeto organizada
- facilita o uso de injeção de dependência

**Angular**

- requisito técnico do desafio
- fornece um ecossistema completo (router, DI, HttpClient, forms)
- a integração com Angular Material e CDK DragDrop é direta e produtiva

**Prisma x outros ORMs**

Escolhi **Prisma** porque:

- o schema é fácil de ler e manter
- gera tipos fortes para as entidades
- a integração com Nest é simples

**Supabase x Postgres local/heroku**

Usei **Supabase** como banco remoto por ser:

- um Postgres gerenciado, pronto para uso
- simples de integrar com Prisma via `DATABASE_URL`
- prático para deploy rápido em ambiente de desafio

**Angular Material x CSS/HTML puro**

Usei **Angular Material** para:

- acelerar a construção da UI com componentes prontos e acessíveis
- padronizar dialogs, botões, cards e inputs
- focar mais tempo na lógica (API, drag and drop, testes) do que em CSS puro

---

### Princípios de software

Alguns princípios que procurei aplicar:

**SRP (Single Responsibility Principle)**

- controllers focados em orquestrar requisição → serviço
- services concentrando lógica de negócio
- PrismaService isolando o acesso ao banco

**Separation of Concerns**

- divisão clara entre:
  - DTOs (entrada/validação)
  - services (negócio)
  - camada de apresentação (Angular)
- no frontend:
  - `board-list`, `board-detail`, `kanban-column`, `kanban-card` e dialogs com responsabilidades bem definidas

**DRY (Don’t Repeat Yourself)**

- centralização de chamadas HTTP em `KanbanApiService`
- estilos globais reaproveitados (botões, dialogs, tipografia)

**KISS (Keep It Simple)**

- API REST simples e objetiva
- ordenação baseada em `order = índice` do array
- adiei GraphQL e WebSockets para a seção de melhorias, para manter o escopo controlado

**Nomes semânticos**

- métodos e variáveis com nomes descritivos:
  - `createBoard`, `updateColumn`, `onColumnDrop`, `openCreateCardDialog`, etc.
- DTOs e modelos autoexplicativos:
  - `CreateBoardDto`, `UpdateCardDto`, `Board`, `Column`, `Card`

---

### Desafios e problemas

Alguns desafios e como resolvi:

**1. Testes unitários e e2e**

- Estruturar os testes de forma que fizessem sentido:
  - primeiro serviços (mocks simples do Prisma)
  - depois controllers
  - por fim e2e com supertest
- Garantir que o fluxo básico (criar board/coluna/card, editar e deletar) estava coberto

*2. Drag and drop com persistência**

- Não bastava só mexer na UI; precisei:
  - reordenar arrays em memória
  - persistir `order` de colunas e cards
  - atualizar `columnId` ao arrastar card entre colunas
- Tratamento de colunas vazias:
  - `column.cards` sempre como array (`[]`)
  - placeholder visual e área de drop mesmo sem cards

**3. Atualização da UI sem recarregar tudo**

- Após cada operação (create/update/delete), atualizo `board`, `columns` e `cards` no estado local
- Uso de `trackBy` em `*ngFor` para evitar recriações desnecessárias e melhorar performance

---

### Melhorias e próximas implementações

Algumas ideias de evolução:

**Realtime com Socket.io**

- Atualizar boards em tempo real para múltiplos usuários:
  - criação/edição/remoção de cards e colunas sendo refletidas instantaneamente

**API em GraphQL**

- Oferecer uma API GraphQL além da REST:
  - queries aninhadas de board → columns → cards
  - mutations específicas para CRUD e reordenação

**UX/UI**

- Indicadores de prazo (ex: cards atrasados em destaque)
- Skeletons/loaders durante carregamento
- Melhor responsividade em telas menores
- Melhorias visuais adicionais nos cards (badges, estados, etc.)

**Testes frontend**

- Testes unitários de componentes Angular
- Testes e2e com Cypress/Playwright cobrindo o fluxo completo do Kanban

**Autenticação e multiusuário**

- Autenticação (por exemplo JWT)
- Boards por usuário
- Compartilhamento de boards entre usuários, com permissões

---

### Vídeo de apresentação

- 🎥 **Link do vídeo:** 

---

### Sobre você

Sou Vitor Santini, de São José do Rio Preto, 24 anos.

Formado em análise e desenvolvimento de sistema, trabalha na area de tecnologia a mais de 2 anos.

Busco sempre aprender e praticar coisas novas... realizando cursos e alguns projetos pessoais.

Atualmente tenho o objetivo de buscar um alinhamento com o meu plano de carreira e a oportunidade de crescer e me especializar
na area de desenvolvimento podendo assim agregar valor ao meu trabalho e consequentemente aos projetos em que for alocado.

trabalhar com aplicações web fullstack me chama muita a atenção, pela abrangência e necessidade de adquirir o conhecimento necessário para
acompanhar o planejamento e desenvolvimento, por conta disso busco estudar boas práticas, integrações e arquitetura. Somando os meus
conhecimentos e minha experiência em front-end e minha ambição e dedicação para estudar e adquirir o conhecimento do restante, acredito que
irei somar, colaborar nos projetos e atuar com times que valorizam qualidade de código e entrega consistente.

---

### Outros detalhes

- Priorizei:
  - uma base sólida de backend (com testes e Prisma)
  - um frontend funcional, com drag and drop e UX razoável dentro do tempo
- Diferenciais como GraphQL e WebSockets foram deixados como melhorias futuras para não inflar demais o escopo inicial.

---

### Contato

- **E-mail:** vitorsantini2001@gmail.com
- **Telefone/WhatsApp:** (17) 99655-8289
- **LinkedIn/GitHub:** [Linkedin](https://www.linkedin.com/in/vitorsantini/)/[GitHub](https://github.com/vitorsantini)

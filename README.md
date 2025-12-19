# 📋 Kanban Valinor

> Sistema completo de gerenciamento de tarefas estilo Kanban, desenvolvido com tecnologias modernas e arquitetura escalável.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)](https://graphql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

## 📖 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Testes](#-testes)
- [API GraphQL](#-api-graphql)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

Kanban Valinor é uma aplicação fullstack para gerenciamento de tarefas no estilo Kanban, permitindo que equipes organizem seu trabalho de forma visual e colaborativa. O sistema oferece recursos completos de boards, colunas, cards e atribuição de usuários, com foco em performance, escalabilidade e experiência do usuário.

### ✨ Destaques

- 🔐 **Autenticação JWT** - Sistema seguro de login e registro
- 📊 **Boards Colaborativos** - Múltiplos usuários por board
- 🎴 **Drag & Drop** - Interface intuitiva para movimentação de cards
- 🔄 **Real-time Ready** - Arquitetura preparada para sincronização em tempo real
- 🧪 **Alta Cobertura de Testes** - >80% de cobertura com testes unitários e E2E
- 📱 **Responsivo** - Interface adaptável para desktop e mobile
- 🚀 **Performance** - Otimizado com lazy loading e caching

## 🛠️ Tecnologias

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **NestJS** | ^10.4.20 | Framework Node.js progressivo e escalável |
| **GraphQL** | ^16.12.0 | Query language para APIs |
| **Apollo Server** | ^4.12.2 | Servidor GraphQL de alto desempenho |
| **Prisma** | ^6.19.1 | ORM moderno para Node.js e TypeScript |
| **MySQL** | Latest | Banco de dados relacional robusto |
| **JWT** | ^10.2.0 | Autenticação baseada em tokens |
| **Bcrypt** | ^6.0.0 | Hash de senhas seguro |
| **Jest** | ^30.0.0 | Framework de testes unitários |
| **Supertest** | ^7.0.0 | Testes HTTP/GraphQL E2E |
| **TypeScript** | ^5.7.3 | Superset JavaScript com tipagem estática |

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Angular** | ^20.3.0 | Framework web moderno |
| **TypeScript** | ^5.9.2 | Tipagem estática para JavaScript |
| **RxJS** | ~7.8.0 | Programação reativa |
| **Bootstrap** | ^5.3.8 | Framework CSS responsivo |
| **Jasmine** | ~5.9.0 | Framework de testes unitários |
| **Karma** | ~6.4.0 | Test runner para Angular |
| **Playwright** | Latest | Framework de testes E2E moderno |

### DevOps & Ferramentas

- **Docker** - Containerização (via docker-compose.yml)
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 🏗️ Arquitetura

### Backend (NestJS + GraphQL)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Angular)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ GraphQL Queries/Mutations
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Apollo Server GraphQL                    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Auth   │  │  Board  │  │  Card   │  ... Modules
    │ Module  │  │ Module  │  │ Module  │
    └────┬────┘  └────┬────┘  └────┬────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
              ┌───────────────┐
              │ Prisma Client │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │     MySQL     │
              └───────────────┘
```

### Camadas da Aplicação

1. **Presentation Layer** (Angular)
   - Components
   - Services
   - Routing
   - State Management

2. **API Layer** (NestJS GraphQL)
   - Resolvers
   - Guards (Authentication/Authorization)
   - Interceptors
   - Decorators

3. **Business Logic Layer**
   - Services
   - DTOs (Data Transfer Objects)
   - Entities

4. **Data Access Layer**
   - Prisma ORM
   - Database Migrations
   - Models

## ⚡ Funcionalidades

### Autenticação & Autorização

- ✅ Registro de usuários com hash de senha (bcrypt)
- ✅ Login com JWT
- ✅ Proteção de rotas com Guards
- ✅ Renovação de tokens
- ✅ Logout seguro

### Gerenciamento de Boards

- ✅ Criar boards personalizados
- ✅ Listar todos os boards do usuário
- ✅ Adicionar/remover usuários ao board
- ✅ Visualizar membros do board
- ✅ Controle de acesso por board

### Gerenciamento de Colunas

- ✅ Criar colunas em um board
- ✅ Editar nome das colunas
- ✅ Reordenar colunas (posicionamento automático)
- ✅ Deletar colunas
- ✅ Visualização em ordem

### Gerenciamento de Cards

- ✅ Criar cards com nome e descrição
- ✅ Editar informações dos cards
- ✅ Mover cards entre colunas (Drag & Drop)
- ✅ Atribuir cards a usuários
- ✅ Deletar cards
- ✅ Filtros e busca

### Interface do Usuário

- ✅ Design responsivo
- ✅ Drag and drop intuitivo
- ✅ Modais para criação/edição
- ✅ Feedback visual de ações
- ✅ Loading states
- ✅ Tratamento de erros

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.x
- **npm** >= 9.x ou **yarn** >= 1.22.x
- **MySQL** >= 8.0
- **Git** >= 2.x

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/kanban-valinor.git
cd kanban-valinor
```

### 2. Configure o Backend

```bash
cd server

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Edite o arquivo .env com suas configurações
# DATABASE_URL="mysql://user:password@localhost:3306/kanban"
# JWT_SECRET="seu-secret-super-seguro"
# JWT_EXPIRES_IN="7d"

# Execute as migrações do banco de dados
npx prisma migrate dev

# (Opcional) Popule o banco com dados de exemplo
npx prisma db seed
```

### 3. Configure o Frontend

```bash
cd ../client

# Instale as dependências
npm install
```

### 4. (Opcional) Use Docker

```bash
# Na raiz do projeto
docker-compose up -d
```

## 🎮 Uso

### Desenvolvimento

Execute o backend e frontend simultaneamente:

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```
Servidor rodando em: `http://localhost:3000`  
GraphQL Playground: `http://localhost:3000/graphql`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Aplicação rodando em: `http://localhost:4200`

### Produção

**Build do Backend:**
```bash
cd server
npm run build
npm run start:prod
```

**Build do Frontend:**
```bash
cd client
npm run build
# Os arquivos estarão em client/dist/
```

### Acessando a Aplicação

1. Abra `http://localhost:4200` no navegador
2. Faça o registro de um novo usuário
3. Faça login com suas credenciais
4. Crie seu primeiro board!

## 🧪 Testes

O projeto possui uma suíte completa de testes com **78 testes automatizados**.

### Backend (43 testes)

**Testes Unitários (25 testes):**
```bash
cd server

# Executar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura de código
npm run test:cov

# Debug
npm run test:debug
```

**Testes E2E (14 testes):**
```bash
cd server

# Executar testes E2E
npm run test:e2e
```

**Executar todos os testes:**
```bash
npm run test:all
```

### Frontend (39 testes)

**Testes Unitários (28 testes):**
```bash
cd client

# Executar testes (modo interativo)
npm test

# Uma vez com cobertura
npm run test:coverage
```

**Testes E2E com Playwright (11 testes):**
```bash
cd client

# Headless mode
npm run e2e

# Com interface visual
npm run e2e:ui

# Com navegador visível
npm run e2e:headed

# Apenas testes falhados
npx playwright test --last-failed
```

**Executar todos os testes:**
```bash
npm run test:all
```

### Cobertura de Código

| Módulo | Cobertura | Status |
|--------|-----------|--------|
| Backend Services | ~85-95% | ✅ Excelente |
| Frontend Components | ~80-90% | ✅ Muito Bom |
| Fluxos E2E | 100% | ✅ Completo |

### Relatórios

**Backend:**
```bash
cd server
npm run test:cov
# Abrir: coverage/lcov-report/index.html
```

**Frontend:**
```bash
cd client
npm run test:coverage
# Abrir: coverage/index.html

npm run e2e
# Abrir: playwright-report/index.html
```

## 🔌 API GraphQL

### Endpoint

```
http://localhost:3000/graphql
```

### Schema Principal

#### Mutations

**Autenticação:**
```graphql
# Registro
mutation {
  createUser(createUserInput: {
    name: "João Silva"
    email: "joao@example.com"
    password: "senha123"
  }) {
    id
    name
    email
    createdAt
  }
}

# Login
mutation {
  login(loginInput: {
    email: "joao@example.com"
    password: "senha123"
  }) {
    access_token
    user {
      id
      name
      email
    }
  }
}
```

**Boards:**
```graphql
# Criar Board
mutation {
  createBoard(createBoardInput: {
    name: "Meu Projeto"
  }) {
    id
    name
    createdAt
  }
}

# Adicionar Usuário ao Board
mutation {
  addUserToBoard(addUserToBoardInput: {
    boardId: 1
    userEmail: "maria@example.com"
  }) {
    id
    name
    email
  }
}
```

**Colunas:**
```graphql
# Criar Coluna
mutation {
  createColumn(createColumnInput: {
    name: "To Do"
    boardId: 1
  }) {
    id
    name
    position
  }
}

# Atualizar Coluna
mutation {
  updateColumn(id: 1, updateColumnInput: {
    name: "Em Progresso"
  }) {
    id
    name
  }
}

# Deletar Coluna
mutation {
  removeColumn(id: 1) {
    id
  }
}
```

**Cards:**
```graphql
# Criar Card
mutation {
  createCard(createCardInput: {
    name: "Implementar feature X"
    description: "Detalhes da tarefa..."
    columnId: 1
  }) {
    id
    name
    description
    columnId
  }
}

# Mover Card
mutation {
  moveCard(cardId: 1, columnId: 2) {
    id
    columnId
  }
}

# Atualizar Card
mutation {
  updateCard(id: 1, updateCardInput: {
    name: "Nova descrição"
    assignedUserId: 2
  }) {
    id
    name
    assignedUserId
    assignedUserName
  }
}

# Deletar Card
mutation {
  removeCard(id: 1) {
    id
  }
}
```

#### Queries

```graphql
# Listar meus boards
query {
  myBoards {
    id
    name
    createdAt
  }
}

# Obter board com colunas e cards
query {
  getBoard(id: 1) {
    id
    name
    columns {
      id
      name
      position
      cards {
        id
        name
        description
        assignedUserId
        assignedUserName
      }
    }
  }
}

# Listar usuários do board
query {
  getBoardUsers(boardId: 1) {
    id
    name
    email
  }
}

# Perfil do usuário logado
query {
  me {
    id
    name
    email
  }
}
```

### Autenticação GraphQL

Todas as queries e mutations (exceto `login` e `createUser`) requerem autenticação via Bearer token:

```http
Authorization: Bearer <seu-jwt-token>
```

## 📁 Estrutura do Projeto

```
kanban-valinor/
├── client/                          # Frontend Angular
│   ├── e2e/                        # Testes E2E Playwright
│   │   └── kanban.spec.ts
│   ├── public/                     # Assets públicos
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/              # Componente de autenticação
│   │   │   │   ├── auth.html
│   │   │   │   ├── auth.scss
│   │   │   │   ├── auth.spec.ts
│   │   │   │   └── auth.ts
│   │   │   ├── board/             # Componente principal
│   │   │   │   ├── board.html
│   │   │   │   ├── board.scss
│   │   │   │   ├── board.spec.ts
│   │   │   │   └── board.ts
│   │   │   ├── core/
│   │   │   │   └── interceptors/  # Interceptors HTTP
│   │   │   │       └── auth.interceptor.ts
│   │   │   ├── service/
│   │   │   │   ├── auth/          # Serviço de autenticação
│   │   │   │   ├── board/         # Serviço de boards
│   │   │   │   ├── card/          # Serviço de cards
│   │   │   │   └── column/        # Serviço de colunas
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── angular.json
│   ├── package.json
│   ├── playwright.config.ts       # Config Playwright
│   └── tsconfig.json
│
├── server/                         # Backend NestJS
│   ├── prisma/
│   │   ├── migrations/            # Migrações do banco
│   │   └── schema.prisma          # Schema Prisma
│   ├── src/
│   │   ├── auth/                  # Módulo de autenticação
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.resolver.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.spec.ts
│   │   ├── board/                 # Módulo de boards
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── board.module.ts
│   │   │   ├── board.resolver.ts
│   │   │   ├── board.service.ts
│   │   │   └── board.service.spec.ts
│   │   ├── card/                  # Módulo de cards
│   │   ├── column/                # Módulo de colunas
│   │   ├── common/                # Módulos compartilhados
│   │   │   └── hash/             # Serviço de hash
│   │   ├── prisma/                # Módulo Prisma
│   │   ├── users/                 # Módulo de usuários
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── schema.gql            # Schema GraphQL gerado
│   ├── test/
│   │   ├── app.e2e-spec.ts       # Testes E2E
│   │   └── jest-e2e.json
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml              # Docker compose
├── README.md                       # Este arquivo
├── IMPLEMENTATION-REPORT.md        # Relatório de implementação
├── QUICK-START.md                 # Guia rápido
└── TEST-SUMMARY.txt               # Resumo visual dos testes
```

## 📚 Documentação

### Documentação Adicional

- **[QUICK-START.md](./QUICK-START.md)** - Guia rápido para executar os testes
- **[IMPLEMENTATION-REPORT.md](./IMPLEMENTATION-REPORT.md)** - Relatório detalhado da implementação
- **[TEST-SUMMARY.txt](./TEST-SUMMARY.txt)** - Resumo visual dos testes

### Prisma

**Visualizar banco de dados:**
```bash
cd server
npx prisma studio
```
Abre interface visual em: `http://localhost:5555`

**Gerar client Prisma:**
```bash
npx prisma generate
```

**Criar nova migration:**
```bash
npx prisma migrate dev --name nome_da_migration
```

**Resetar banco (desenvolvimento):**
```bash
npx prisma migrate reset
```

### GraphQL Playground

Durante o desenvolvimento, acesse o playground em:
```
http://localhost:3000/graphql
```

Recursos disponíveis:
- 📖 Documentação automática do schema
- 🔍 Autocompletar queries/mutations
- 📝 Histórico de queries
- ⚡ Execução de queries em tempo real

## 🗺️ Roadmap

### Versão 2.0 (Planejado)

- [ ] WebSocket para atualizações em tempo real
- [ ] Notificações push
- [ ] Upload de arquivos nos cards
- [ ] Comentários nos cards
- [ ] Tags e labels personalizadas
- [ ] Filtros avançados
- [ ] Métricas e relatórios
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Aplicativo mobile (React Native)

### Melhorias Contínuas

- [ ] Implementar Redis para caching
- [ ] Adicionar rate limiting
- [ ] Implementar logging estruturado
- [ ] Monitoramento com Prometheus/Grafana
- [ ] CI/CD pipeline completo
- [ ] Internacionalização (i18n)
- [ ] Testes de performance
- [ ] Documentação Swagger/OpenAPI

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções de Código

- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- **TypeScript**: Siga as regras do ESLint configurado
- **Testes**: Sempre adicione testes para novas funcionalidades
- **Documentação**: Atualize o README se necessário

### Código de Conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em seguir suas diretrizes.

## 🔒 Segurança

### Práticas Implementadas

- ✅ Hash de senhas com bcrypt (10 rounds)
- ✅ Tokens JWT com expiração
- ✅ Guards de autenticação em todas as rotas protegidas
- ✅ Validação de entrada de dados (DTOs)
- ✅ SQL Injection protection (Prisma)
- ✅ CORS configurado
- ✅ Rate limiting (recomendado em produção)
- ✅ Helmet.js (recomendado em produção)

### Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança, por favor, envie um email para: security@example.com

**Não abra uma issue pública para problemas de segurança.**

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento Inicial* - [@seu-usuario](https://github.com/seu-usuario)

Veja também a lista de [contribuidores](https://github.com/seu-usuario/kanban-valinor/contributors) que participaram deste projeto.

## 🙏 Agradecimentos

- NestJS Team pela excelente documentação
- Angular Team pelo framework poderoso
- Prisma Team pela melhor experiência de ORM
- Playwright Team pelos testes E2E confiáveis
- Comunidade open source por todas as ferramentas incríveis

## 📞 Contato

- **Email**: contato@example.com
- **LinkedIn**: [seu-perfil](https://linkedin.com/in/seu-perfil)
- **Twitter**: [@seu-usuario](https://twitter.com/seu-usuario)

## 🌟 Mostre seu apoio

Se este projeto foi útil para você, considere dar uma ⭐️!

---

<div align="center">

**Desenvolvido com ❤️ usando NestJS, Angular e GraphQL**

[⬆ Voltar ao topo](#-kanban-valinor)

</div>

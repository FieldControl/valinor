# Kanban Board - Monorepo com Angular e NestJS

Este projeto implementa um Kanban básico utilizando Angular para o frontend e NestJS para o backend, organizados em um monorepo com NX.

## 🚀 Tecnologias Utilizadas

### Backend (NestJS)

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **SQLite** - Banco de dados
- **class-validator** - Validação de dados
- **class-transformer** - Transformação de dados

### Frontend (Angular)

- **Angular 20** - Framework frontend
- **Angular CDK** - Componentes e utilitários
- **Tailwind CSS** - Framework CSS
- **RxJS** - Programação reativa

### DevOps

- **NX** - Monorepo e build tools
- **Jest** - Testes unitários
- **Cypress** - Testes E2E

## 📁 Estrutura do Projeto

```
apps/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── columns/         # Módulo de colunas
│   │   │   ├── dto/         # DTOs de validação
│   │   │   ├── entities/    # Entidades TypeORM
│   │   │   ├── columns.controller.ts
│   │   │   ├── columns.service.ts
│   │   │   └── columns.module.ts
│   │   ├── cards/          # Módulo de cards
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── cards.controller.ts
│   │   │   ├── cards.service.ts
│   │   │   └── cards.module.ts
│   │   ├── database/       # Configuração do banco
│   │   └── app/           # Módulo principal
├── frontend/              # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Componentes do Kanban
│   │   │   ├── services/   # Serviços Angular
│   │   │   └── models/     # Interfaces TypeScript
│   │   └── styles.css
└── frontend-e2e/          # Testes E2E
```

## 🛠 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Roda backend e frontend simultaneamente
npm run dev:backend         # Apenas backend
npm run dev:frontend        # Apenas frontend

# Build
npm run build               # Build de ambos
npm run build:backend       # Build do backend
npm run build:frontend      # Build do frontend

# Testes
npm run test                # Testes de ambos
npm run test:backend         # Testes do backend
npm run test:frontend        # Testes do frontend
npm run e2e                  # Testes E2E


# Linting
npm run lint                 # Lint de ambos os projetos
```

## 🚀 Como Executar

### Desenvolvimento Local

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**

   ```bash
   npm run dev
   ```

3. **Acessar as aplicações:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api

## 📊 API Endpoints

### Colunas

- `GET /api/columns` - Listar todas as colunas
- `POST /api/columns` - Criar nova coluna
- `GET /api/columns/:id` - Buscar coluna por ID
- `PATCH /api/columns/:id` - Atualizar coluna
- `DELETE /api/columns/:id` - Deletar coluna
- `PATCH /api/columns/positions/update` - Atualizar posições

### Cards

- `GET /api/cards` - Listar todos os cards
- `GET /api/cards?columnId=:id` - Listar cards de uma coluna
- `POST /api/cards` - Criar novo card
- `GET /api/cards/:id` - Buscar card por ID
- `PATCH /api/cards/:id` - Atualizar card
- `DELETE /api/cards/:id` - Deletar card
- `PATCH /api/cards/:id/move` - Mover card entre colunas
- `PATCH /api/cards/positions/update` - Atualizar posições

## 🗄 Modelos de Dados

### Column

```typescript
{
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Card

```typescript
{
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  columnId: number;
  column: Column;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testes

### Backend

- **Testes unitários:** Jest
- **Testes de integração:** Jest + Supertest
- **Cobertura:** Configurada para 80%

### Frontend

- **Testes unitários:** Jest + Angular Testing Utilities
- **Testes E2E:** Cypress
- **Cobertura:** Configurada para 80%

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
DATABASE_URL=sqlite:./data/kanban.db
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### Banco de Dados

O projeto usa SQLite por padrão, mas pode ser facilmente configurado para PostgreSQL ou MySQL alterando a configuração em `apps/backend/src/database/database.config.ts`.

## 📝 Próximos Passos

- [ ] Implementar autenticação e autorização
- [ ] Adicionar filtros e busca
- [ ] Implementar notificações em tempo real
- [ ] Adicionar upload de arquivos
- [ ] Implementar histórico de atividades
- [ ] Adicionar métricas e analytics

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

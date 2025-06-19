Kanban API – NestJS + Prisma

API backend para um sistema Kanban com suporte a colunas e cartões (cards), desenvolvida com NestJS, Prisma ORM e PostgreSQL.

---

# Funcionalidades Atual

CRUD de Colunas
CRUD de Cards
Associação entre Cards e Colunas
Estrutura modular seguindo boas práticas do NestJS
Testes unitários básicos com Jest

---

# Estrutura do Projeto

/src
cards/
cards.controller.ts
cards.service.ts
dto/
create-card.dto.ts
update-card.dto.ts
columns/
columns.controller.ts
columns.service.ts
dto/
create-column.dto.ts
update-column.dto.ts
prisma/
prisma.service.ts
app.module.ts
main.ts

CardsService.spec.ts – cobertura de instância e operações básicas
CardsController.spec.ts– inclui mock de serviço e testes do 'findAll'

# Tecnologias utilizadas

NestJS
Prisma ORM
PostgreSQL
Jest para testes unitários

# Video Iniciando e funcionando no Postman (Backend) no Youtube

Link iniciando no vscode o backend: https://youtu.be/5Cbd86OX9f4
Link postman: https://youtu.be/rbbTXjrjPHM

# Instalar dependências

npm install

# Gerar client do Prisma

npx prisma generate

# Rodar migrações

npx prisma migrate dev

# Iniciar o servidor

npm run start:dev

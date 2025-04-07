# Projeto Fullstack - Angular + NestJS

## 📘 Documentação do Projeto

### 🔧 Como executar o projeto

**Backend (NestJS):**
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` com as variáveis de ambiente necessárias para o banco de dados:
   ```
   DB_HOST=...
   DB_PORT=...
   DB_USERNAME=...
   DB_PASSWORD=...
   DB_NAME=...
   JWT_SECRET=...
   ```
3. Execute a aplicação:
   ```bash
   npm run start:dev
   ```

**Frontend (Angular):**
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `environment.ts` com a URL da API:
   ```ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000',
   };
   ```
3. Execute:
   ```bash
   ng serve
   ```

> **Observação**: O projeto ainda não foi publicado online, mas está preparado para deploy em serviços como Railway (backend) e Netlify (frontend).

---

### Como testar

- Para testar o login:
  - Use o email padrão: `admin@gmail.com`
  - Senha: `1234`
- O token é salvo via `localStorage` e usado para autenticação nas demais rotas.

---

## Tecnologias e bibliotecas utilizadas

- **Backend:**
  - NestJS
  - TypeORM
  - PostgreSQL
  - JWT (para autenticação)

- **Frontend:**
  - Angular
  - Angular Forms
  - Angular Router
  - HttpClient

---

## Por que escolhi essas tecnologias?

- **NestJS**: estrutura organizada, com injeção de dependência nativa, muito bom para projetos escaláveis.
- **Angular**: já possui estrutura pronta para formulários, rotas, e integração com APIs REST.
- **PostgreSQL**: banco de dados robusto, gratuito, bem suportado.

---

## Princípios de engenharia de software aplicados

- **Separacão de responsabilidades**: os módulos estão bem divididos entre autenticação, usuários e tarefas.
- **DRY (Don't Repeat Yourself)**: evitei repetição de código criando serviços reutilizáveis.
- **Segurança**: uso de JWT para autenticação protegendo rotas privadas.

---

## Desafios enfrentados

- **Deploy no Railway e Netlify**: tentei configurar, mas optei por deixar fora do ar por enquanto. O projeto está pronto para isso.
- **CORS entre frontend e backend**: adicionei configurações personalizadas no `main.ts` do NestJS para permitir requisições do frontend.
- **Prerendering do Angular quebrando com `localStorage`**: optei por não usar SSR para evitar esse tipo de erro.

---

## Melhorias possíveis

- **Publicar o projeto online** em Railway (backend) e Netlify (frontend).
- **Adicionar refresh token e roles** para tornar a autenticação mais robusta.
- **Implementar testes unitários e e2e** no backend e frontend.
- **Criar um sistema de mensagens em tempo real** com WebSocket para colaboração.
- **Melhorar o layout e responsividade do frontend** com alguma lib de UI como Tailwind ou Angular Material.


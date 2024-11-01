# Projeto Kanban - Angular e NestJS

---

## Visão Geral
Este é um projeto de gerenciamento de tarefas estilo Kanban, construído com **Angular** para o frontend e **NestJS** para o backend, utilizando **TypeORM** para a conexão e manipulação do banco de dados.

---

## Tecnologias Usadas
- **Frontend**: Angular, Angular Material
- **Backend**: NestJS, TypeORM, JWT para autenticação
- **Banco de Dados**: MySQL 

---

## Configuração e Instalação
**Requisitos**:
-- Node.js e npm
Você pode baixar o nodejs acessando seu site oficial: (https://nodejs.org/en/)
- Angular CLI
  ```
  npm install -g @angular/cli
  ```
-NestJS CLI
  ```
  npm install -g @nestjs/cli
  ```
**Caso de erro na instalação tente digitar esse codigo no cdm:**
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUse 
```


- Banco de dados MySQL
(-Neste projeto foi utilizado um ambiente de servidor local, o XAMPP, porém você pode usar o que preferir,
apenas configure de forma correta o acesso ao banco de dados no arquivo backend\src\app.module.ts

-Também tem o requisito de criar manualmente um banco de dados vazio com o nome de "kanban" para ocorrer tudo 
de forma correta
)

### Inicie o backend:
```bash
cd backend
npm run start:dev

Acesse o frontend em: [http://localhost:4200](http://localhost:4200)
```


## Estrutura do Projeto

### Frontend (Angular)
O frontend possui a seguinte estrutura de pastas dentro de `src`:

- **styles**: contém dois arquivos `.scss` para estilização global da aplicação.
- **app**: organiza os principais módulos e funcionalidades do projeto:
  - **core**:
    - **components**: contém os componentes compartilhados, como o `header`.
    - **interceptors**: abriga o interceptor `jwt.interceptor` para tratamento de tokens JWT nas requisições.
  - **features**:
    - **account**: inclui funcionalidades relacionadas a contas, com subpastas para `register` e `login`.
    - **boards**:
      - **components**: abriga componentes específicos para a funcionalidade de boards, incluindo subpastas para `add-board`, `add-card` e `edit-swimlane`.
      - **detail**: contém os componentes detalhados do `board` em arquivos `.ts`, `.scss` e `.html`.
      - **list**: estrutura semelhante ao `detail`, porém para listagem de boards.
  - **shared**:
    - **guards**: contém o `authGuard.ts` para proteção de rotas autenticadas.
    - **models**: guarda os modelos principais da aplicação, como `board.model` e `user.model`.
    - **services**: abriga os serviços do frontend, incluindo `auth`, `board`, `card`, `swimlane` e `user`.
    - **ui**: contém o componente `confirm`, responsável pela exibição de diálogos de confirmação na UI.
- **app.config** e **app.routes**: configuram as rotas e definições gerais do aplicativo.

### Backend (NestJS)
O backend possui a seguinte estrutura de pastas dentro de `src`, organizando as funcionalidades do projeto:

- **auth**: responsável pela autenticação e autorização, com as seguintes subpastas e arquivos:
  - **auth**: contém o `authGuard`, que executa as seguintes operações:
    - Extrai o token do cabeçalho de autorização da requisição.
    - Lança uma `UnauthorizedException` caso o token esteja ausente ou inválido; se válido, o payload é anexado ao objeto de requisição.
  - **dto**: inclui os Data Transfer Objects `login.dto` e `register.dto` para operações de login e registro.
  - **entities**: define a entidade `Auth`, atualmente com a estrutura `export class Auth {}`.
  - **auth.controller.ts**, **auth.module.ts**, e **auth.service.ts**: controlam a lógica do módulo de autenticação.
- **board**: gerencia as funcionalidades relacionadas aos `boards`, incluindo:
  - **dto**: objetos de transferência de dados específicos do `Board`.
  - **entities**: define a entidade `Board`.
  - **board.controller.ts**, **board.module.ts**, e **board.service.ts**: módulos que gerenciam a lógica do `Board`.
- **card, swimlane e user**: seguem uma estrutura semelhante à de `board`, incluindo arquivos `controller`, `module` e `service`, além de suas respectivas pastas:
  - **dto**: objetos de transferência de dados para as operações de `card`, `swimlane` e `user`.
  - **entities**: define as entidades específicas de cada módulo (`Card`, `Swimlane` e `User`) com colunas e relacionamentos personalizados.

---

## Banco de Dados e TypeORM
### Entidades e Relacionamentos
- **Board**: possui uma relação **OneToMany** com `Swimlane` e uma relação **ManyToMany** com `User`.
- **Swimlane**: contém múltiplos `Cards`.
- **Card**: representa uma tarefa individual.

---

## Funcionalidades

### Autenticação e Autorização
- Utiliza **JWT** para autenticar usuários.
- A interface `PayloadRequest` adiciona dados do usuário à requisição, facilitando a validação de permissões.

### Kanban Board
- **Swimlanes e Cards**: é possível criar, editar e deletar `cards`. `Swimlanes` podem ser deletadas.

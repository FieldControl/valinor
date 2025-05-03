# Kanban App

Este é um sistema básico de Kanban desenvolvido com Angular no frontend e NestJS no backend. Ele permite a criação dinâmica de colunas e cards, oferecendo uma base sólida para gerenciamento de tarefas.

## Tecnologias Utilizadas

### Frontend
- **Angular 17+**: Framework robusto para aplicações SPA com excelente suporte a componentes, injeção de dependência e roteamento.
- **TypeScript**: Linguagem fortemente tipada que aumenta a segurança e manutenção do código.
- **RxJS**: Utilizado para manipulação de eventos assíncronos com Observables.
- **Angular Material**: Framework de UI que oferece componentes acessíveis e responsivos.
- **Jasmine & Karma**: Para testes unitários no frontend.

### Backend
- **NestJS 10+**: Framework baseado em Node.js e inspirado no Angular, com suporte nativo a arquitetura modular, injeção de dependência e validações.
- **TypeScript**: Uniformidade entre frontend e backend.
- **PostgreSQL** com **TypeORM**: Banco relacional robusto com ORM eficiente para manipulação de entidades.
- **Jest & Supertest**: Para testes unitários e de integração.

---

## Funcionalidades
- Criação de colunas (ex: “A Fazer”, “Em Andamento”, “Concluído”)
- Adição, movimentação e exclusão de cards entre colunas
- Suporte opcional a atualização em tempo real via WebSocket

---

## Instruções para Executar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/kanban-app.git
cd kanban-app
```

### 2. Instale as dependências
#### Frontend:
```bash
cd frontend
npm install
```
#### Backend:
```bash
cd ../backend
npm install
```

### 3. Configure o banco de dados (PostgreSQL)
Crie um banco de dados chamado `kanban_db` e configure as credenciais no arquivo `.env` do backend:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=senha
DB_NAME=kanban_db
```

### 4. Execute o backend
```bash
npm run start:dev
```

### 5. Execute o frontend
```bash
cd ../frontend
ng serve
```
Acesse em: http://localhost:4200

---

## Estrutura de Diretórios

### _Backend_
```
_backend/_
├── _src/_
│   ├── _app.module.ts_
│   ├── _columns/_
│   └── _cards/_
├── _test/_
├── _.env_
└── _main.ts_
```

### _Frontend_
```
_frontend/_
├── _src/_
│   ├── _app/_
│   │   ├── _components/_
│   │   ├── _services/_
│   │   └── _models/_
├── _angular.json_
└── _main.ts_
```

---

## Testes

### Backend
```bash
npm run test
```
- Testes unitários com Jest
- Testes de integração usando Supertest nos endpoints principais

### Frontend
```bash
ng test
```
- Testes unitários com Jasmine e Karma

---

## Documentação da API
Após iniciar o backend, acesse a documentação Swagger:
```
http://localhost:3000/api
```

---

## Boas Práticas Adotadas
- **Princípios SOLID** para organização e responsabilidade do código.
- **Modularização**: separação de funcionalidades em módulos independentes.
- **DTOs com validação** (class-validator / class-transformer) para manter integridade dos dados.
- **Injeção de dependência**: facilita testes e desacoplamento.
- **Swagger** para documentação clara da API.
- **Testes automatizados** garantindo regressão e comportamento esperado.
- **Arquitetura limpa** e responsividade com Angular Material.

---

## Decisões de Tecnologia

### Angular vs React
Angular foi escolhido pela sua arquitetura opinativa, estrutura completa e integração facilitada com RxJS, tornando-o ideal para aplicações corporativas modulares.

### NestJS vs Express
NestJS oferece estrutura modular, suporte nativo a TypeScript, validação via decorators, testes integrados com Jest e facilidade de integração com TypeORM e Swagger, superando a simplicidade do Express em projetos mais complexos.

---

## Desafios e Soluções
- **Modelagem de entidades**: Evitar dependências cíclicas entre `Card` e `Column`. Resolvido com relações unidirecionais e mapeamento via TypeORM.
- **Manutenção de estado reativo no frontend**: Usamos `BehaviorSubject` para refletir mudanças nos componentes.
- **Isolação de testes**: Uso de repositórios in-memory com mocks para testar sem afetar o banco real.

---

## Futuras Melhorias
- Autenticação de usuário
- Compartilhamento de quadros
- Drag-and-drop com persistência em tempo real
- Deploy na nuvem (ex: Vercel + Render)
- Acessibilidade (teclado/navegadores assistivos)
- Internacionalização com i18n

---

## Licença
[MIT](LICENSE)

---

## Autor
Este projeto foi desenvolvido por [Victor Custodio], com apoio de inteligência artificial para auxiliar nas decisões técnicas e na implementação, devido à falta de experiência prévia com esse tipo de aplicação.

Sou natural de São José do Rio Preto (SP) e iniciei minha trajetória em tecnologia durante o ensino médio, por meio de um curso técnico integrado em TI. Nesse período, tive meus primeiros contatos com lógica de programação, redes e desenvolvimento de sistemas.

Minha motivação para ingressar na área de desenvolvimento de software surgiu da curiosidade em entender como funcionam os sistemas por trás das interfaces e da vontade de criar soluções úteis. Ainda estou no início da minha jornada profissional e vejo neste projeto uma valiosa oportunidade de aprendizado prático.

Embora ainda não tenha experiência formal na área, estou em busca de oportunidades e comprometido com o desenvolvimento contínuo por meio de projetos reais como este.

**Contato:**  
📧 victorccustodio8@gmail.com  
📱 (17) 99624-7299

# Kanban - Desafio Field Control

Este projeto consiste em um Kanban básico, desenvolvido como parte do desafio técnico da Field Control. Ele permite a criação de colunas e cards, seguindo boas práticas de desenvolvimento, incluindo testes unitários e integração.

## Tecnologias Utilizadas

- Frontend: Angular, Apollo Client (GraphQL)

- Backend: NestJS, GraphQL, PostgreSQL (via Prisma ORM)

- Infraestrutura: Railway (Backend e Banco de Dados), Vercel (Frontend)

- Testes: Jest (testes unitários e de integração)

## 🛠 Como Executar o Projeto

Pré-requisitos:

Antes de iniciar, certifique-se de ter instalado:

- Node.js: Baixe o instalador aqui
- NestJS: Instale via npm
- Angular: Instale via npm


Para instalar o node.js baixe o instalador no link abaixo:

https://nodejs.org/pt

Após instalar o Node.js, execute os seguintes comandos para garantir que o ambiente de desenvolvimento esteja configurado:

```bash
# Comando para baixar o Nextjs
npm install -g @nestjs/cli

# Verifique se foi instalado:
nest --version


# Comando para baixar o Angular
npm install -g @angular/cli

#Verifique se foi Instalado:
ng version
```

## Clone o repositório

Clone o repositório para a sua máquina:
```bash
# Clone o repositorio
git clone https://github.com/DevSamuelBrito/valinor.git
```

Após clonar abra o terminal na pasta do projeto.
## Backend

1. Crie um arquivo .env dentro da pasta backend e adicione a seguinte variável:
```bash
DATABASE_URL="postgresql://postgres:RawFIhAkZQELkORRZBjNUMQrxaHiDlWa@metro.proxy.rlwy.net:19350/railway"
```
2. Acesse a pasta do backend e instale as dependências:
```bash
# Caso não esteja dentro da pasta do backend de o seguinte comando:
cd backend

# Instale as dependências
npm install

# Inicie o servidor
npm run start:dev
```

O backend estará rodando em http://localhost:3000/graphql

Para rodar os testes unitários e de integração, use o seguinte comando:
```bash
# Rodar os testes
npm run test
```
Caso ele não apareça seleciona "a" para rodar todos os testes.


## Frontend

```bash
# Acesse a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação
ng serve
```

O frontend estará disponível em http://localhost:4200


# Observações
## 📖 Decisões Técnicas e Aprendizados

  - GraphQL: Escolhido para explorar novas formas de comunicação entre frontend e backend.
  - NestJS: Primeira experiência com o framework, mas mostrou-se robusto e modular.
  - Angular: Como desenvolvedor React/Next.js, foi um desafio adaptar-se ao modelo do Angular.
  - Deploy: A Vercel foi utilizada para o frontend e a Railway para backend e banco de dados.

## 🛠 Possíveis Melhorias

  - Rework do Frontend: Com mais tempo, o frontend poderia ser mais polido e intuitivo.
  - Sistema de Login: Implementar autenticação com Firebase para que cada usuário tenha seu próprio Kanban.
  - Melhoria na DX: Adicionar uma documentação de API mais detalhada e um sistema de logs eficiente.



## Tutorial Kanban:

Para verificar o sistema funcionando acesse:
https://valinor-nine.vercel.app/

### Como usar?

1. Clique no botão para Criar Coluna. A nova coluna aparecerá na parte inferior da tela.
2. Depois de criar a coluna, você pode:
    - Editar o nome da coluna.
    - Criar um Card dentro dela.
    - Excluir a coluna.
3. Com um Card criado, você pode:
    - Editar o nome do card.
    - Editar a descrição do card.
    - Excluir o card.


# Kanban Backend - FieldControl

Este é o backend para o sistema de Kanban desenvolvido com NestJS.

## Tecnologias Utilizadas
- NestJS 11
- TypeORM
- MySQL
- RxJS

## Requisitos
Antes de iniciar o projeto, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão recomendada: 18+)

## Instalação
1. Clone este repositório:
   ```sh
   git clone <URL_DO_REPOSITORIO>
   ```
2. Acesse o diretório do projeto:
   ```sh
   cd backend
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```

## Configuração do Banco de Dados
O projeto utiliza MySQL via TypeORM. Configure as variáveis de ambiente no arquivo `.env`. Disponivel no `.env.example` tambem:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kanban
DB_USERNAME=root
DB_PASSWORD=
```
## Como Executar
### Ambiente de Desenvolvimento
```sh
npm run start:dev
```
O backend estará rodando em `http://localhost:3000/`

### Ambiente de Produção
```sh
npm run build
npm run start:prod
```

## Comandos Disponíveis
- **Iniciar o servidor**:
  ```sh
  npm start
  ```
- **Rodar em modo desenvolvimento**:
  ```sh
  npm run start:dev
  ```
- **Gerar build para produção**:
  ```sh
  npm run build
  ```
- **Executar testes**:
  ```sh
  npm test
  ```
- **Executar testes de cobertura**:
  ```sh
  npm run test:cov
  ```

## Estrutura do Projeto
```
backend/
├── src/
│   ├── modules/                       # Módulos do sistema
│   │   ├── board/                     # Módulo de Boards
│   │   |   ├── dtos/                  # Dto do board
|   │   |   ├── entities/              # Entidades do board
│   │   |   ├── board.service.ts       # Serviço do board
│   │   |   ├── board.controller.ts    # Controlador do board
|   │   |   ├── board.module.ts        # Módulo do board
│   │   ├── card/                      # Módulo de Cards
│   │   ├── column/                    # Módulo de Colunas
│   ├── main.ts                        # Arquivo principal
│   ├── app.module.ts                  # Módulo raiz
├── test/                              # Testes automatizados
├── dist/                              # Código transpilado para produção
├── .env                               # Variáveis de ambiente
├── package.json                       # Dependências e scripts do projeto
├── tsconfig.json                      # Configuração do TypeScript
└── README.md                          # Documentação do projeto
```

# Kanban Board - Projeto FieldControl

Um sistema de Kanban completo construído com Angular 19 e GraphQL, com backend em NestJS e Firebase para persistência de dados.

## 🚀 Demo

A aplicação está implantada e disponível em: [https://ronaldochiavegatti.github.io/kanban-entrega/](https://ronaldochiavegatti.github.io/kanban-entrega/)

## 📋 Funcionalidades

- Criação, edição e exclusão de quadros Kanban
- Gerenciamento de colunas (adicionar, editar, reordenar, excluir)
- Gerenciamento de cartões (adicionar, editar, mover entre colunas, excluir)
- Autenticação de usuários usando Firebase
- Interface responsiva e intuitiva
- Persistência de dados em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 19**: Framework web moderno e reativo
- **Apollo Angular**: Cliente GraphQL para Angular
- **Firebase Auth**: Autenticação de usuários
- **Angular CDK**: Para operações de drag-and-drop

### Backend
- **NestJS**: Framework para construção de aplicações server-side
- **GraphQL**: API para comunicação cliente-servidor
- **Firebase**: Armazenamento de dados e autenticação
- **TypeGraphQL**: Criação de schemas GraphQL com TypeScript

## 📦 Estrutura do Projeto

O projeto está organizado em três partes principais:

```
/
├── frontend/      # Aplicação Angular
├── backend/       # Servidor GraphQL com NestJS
└── docs/          # Documentação técnica e diagramas
```

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js (v14+)
- NPM ou Yarn
- Conta no Firebase (para autenticação e banco de dados)

### Configuração do Backend

1. Navegue para a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha com suas credenciais do Firebase

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Configuração do Frontend

1. Navegue para a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha com suas credenciais do Firebase e URL da API GraphQL

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

5. Acesse a aplicação em `http://localhost:4200`

## 🧪 Testes

### Testes no Backend
```bash
cd backend
npm test           # Executa todos os testes
npm run test:watch # Executa testes em modo watch
```

### Testes no Frontend
```bash
cd frontend
ng test            # Executa testes unitários
```

## 📖 Documentação

A pasta `docs/` contém diagramas e documentação técnica detalhada sobre a arquitetura e implementação do projeto:

- Diagrama de Classes
- Diagrama de Componentes
- Diagrama de Casos de Uso
- Diagrama de Sequência
- Diagrama de Implantação

Para visualizar os diagramas, acesse a pasta `docs/diagrams/png/`.

## 📝 Princípios de Engenharia de Software Aplicados

- **SOLID**: Princípios aplicados para garantir código manutenível e escalável
- **DRY (Don't Repeat Yourself)**: Evitando duplicação de código
- **Arquitetura Limpa**: Separação clara de responsabilidades
- **TDD (Test-Driven Development)**: Desenvolvimento guiado por testes
- **CI/CD**: Integração e entrega contínuas para deploy automatizado

## 🧠 Decisões Técnicas

### Por que Angular e não React ou Vue?
Angular foi escolhido por sua robustez em projetos corporativos, forte tipagem via TypeScript, e ferramentas integradas para testes e construção de aplicações. O framework proporciona uma estrutura organizada que facilita a manutenção em projetos maiores.

### Por que GraphQL em vez de REST?
GraphQL oferece maior flexibilidade para consultas de dados, reduz o problema de over-fetching e under-fetching, e proporciona uma documentação automática da API. Isso torna o desenvolvimento frontend mais eficiente e a comunicação cliente-servidor mais otimizada.

### Por que Firebase?
O Firebase foi escolhido como solução de backend por sua facilidade de configuração, escalabilidade automática e recursos integrados de autenticação e armazenamento em tempo real, permitindo focar mais no desenvolvimento das funcionalidades do que na infraestrutura.

## 🔍 Desafios Enfrentados e Soluções

1. **Desafio**: Implementação do drag-and-drop entre colunas
   **Solução**: Utilizamos o Angular CDK para implementar o drag-and-drop, com uma lógica customizada para atualizar a ordem dos cartões no backend.

2. **Desafio**: Sincronização em tempo real entre múltiplos usuários
   **Solução**: Implementamos um sistema de polling GraphQL otimizado que atualiza os dados em intervalos regulares, mantendo a interface do usuário sincronizada.

3. **Desafio**: Autenticação segura e persistente
   **Solução**: Utilizamos o Firebase Authentication com tokens JWT para autenticação, implementando guards no Angular para proteger rotas e resolvers GraphQL autenticados no backend.

## 🚀 Melhorias Futuras

- Implementar WebSockets para sincronização em tempo real
- Adicionar funcionalidade de filtro e busca de cartões
- Implementar tema escuro e personalização visual
- Adicionar recursos de colaboração em tempo real
- Expandir cobertura de testes automatizados

## 👨‍💻 Autor

Desenvolvido por [@RonaldoChiavegatti](https://github.com/RonaldoChiavegatti) como parte do desafio de programação da FieldControl.

## 📄 Licença

Este projeto está sob a licença MIT. 
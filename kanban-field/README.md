# Introdução

## Agradecimento e Feedback do Desafio

- Quero agradecer à Field por essa chance. Vou ser sincero: esse desafio foi difícil, mas muito gratificante.
- Até uma semana atrás, eu não sabia nada de Angular. Para entregar o projeto, mergulhei em vídeos, pesquisas e usei a ajuda de IAs. Sei que o resultado é simples e que ainda tenho muito o que melhorar tecnicamente, mas estou orgulhoso de ter saído do zero e terminado a tarefa em tão pouco tempo.
- Descobri que o Angular é uma ferramenta incrível. Agora, ele entrou de vez na minha lista de estudos. Espero ter a chance de continuar evoluindo e explorando esse mundo da tecnologia junto com o time de vocês!
- Muito obrigado pela oportunidade!

## 🚀 Como Executar o Projeto

### 📦 Requisitos

- **Node.js 18+**
- **NPM**
- **Angular CLI** (instalado globalmente)

### 📁 Clonar o projeto

```bash
git clone https://github.com/Otaviofachin/valinor.git
cd kanban-field
```

### 🌐 Instalação e Execução

#### 1. Instalar o Angular CLI (caso não tenha)

```bash
npm install -g @angular/cli
```

#### 2. Instalar as dependências

```bash
npm install
```

#### 3. Executar o projeto

```bash
ng serve
```

ou

```bash
npm start
```

## Acesse em: **http://localhost:4200**

## 🧠 Tecnologias Utilizadas

### 📌 Frontend

- **Angular 20+** – Framework moderno e robusto para aplicações SPA.
- **Angular Material** – Componentes UI prontos e acessíveis (dialogs, toolbar, buttons, icons).
- **Angular CDK (Drag and Drop)** – Implementação nativa de drag-and-drop para movimentação de cards entre colunas.
- **TypeScript** – Tipagem forte, maior segurança e manutenibilidade.
- **RxJS** – Programação reativa para gerenciamento de estado e eventos.
- **UUID** – Geração de IDs únicos para colunas e cards.
- **TypeScript Toastify** – Notificações toast elegantes para feedback ao usuário.
- **SCSS** – Estilização modular e reutilizável.

### 📌 Armazenamento

- **In-Memory Storage** – Armazenamento local simples (sem banco de dados), ideal para MVPs e demonstrações.

---

## ❓ Por que escolhi essas tecnologias?

- **Angular** foi escolhido por seu poder de estruturação de aplicações complexas, tipagem forte via TypeScript e facilidade de manutenção em equipe.
- **Angular Material** oferece componentes prontos e acessíveis, acelerando o desenvolvimento e garantindo consistência visual.
- **Angular CDK** proporciona funcionalidades avançadas como drag-and-drop de forma nativa e performática.
- **In-memory storage** foi usado para manter o projeto leve, local e simples, ideal para fins didáticos e MVPs.
- **TypeScript Toastify** adiciona feedback visual elegante sem dependências pesadas.

---

## 🧱 Princípios de Engenharia de Software Aplicados

✅ **Separation of Concerns (SoC)**: Serviço centralizado (`KanbanService`) para manipulação de colunas e cards.
✅ **Single Responsibility Principle (SRP)**: Cada componente possui uma única responsabilidade clara:

- `BoardComponent`: Gerencia o quadro Kanban e coordena as interações.
- `ColumnComponent`: Representa uma coluna individual com suas funcionalidades.
- `CardComponent`: Representa um card individual com edição e exclusão.
- `AddColumnDialogComponent`: Dialog modal para adicionar novas colunas.
  ✅ **Clean Code**: Nomes semânticos, código organizado, componentes reutilizáveis.
  ✅ **Componentização**: Frontend dividido em componentes modulares e reutilizáveis.
  ✅ **Dependency Injection**: Uso do sistema de injeção de dependências do Angular para gerenciar serviços.
  ✅ **Reactive Programming**: Uso de RxJS para gerenciamento de eventos e estado.

---

## 🏗️ Estrutura do Projeto

```
kanban-field/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── board/              # Componente principal do quadro Kanban
│   │   │   ├── column/             # Componente de coluna
│   │   │   ├── card/               # Componente de card
│   │   │   └── add-column-dialog/  # Dialog para adicionar colunas
│   │   ├── interfaces/
│   │   │   └── kanban.interface.ts # Interfaces TypeScript (Card, Column)
│   │   ├── services/
│   │   │   └── kanban.service.ts   # Serviço centralizado de gerenciamento
│   │   ├── app.ts                  # Componente raiz
│   │   └── app.config.ts           # Configuração da aplicação
│   ├── styles.scss                 # Estilos globais
│   └── index.html                  # HTML principal
├── package.json                    # Dependências e scripts
└── README.md                       # Este arquivo
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Gerenciamento de Colunas

- ➕ **Adicionar colunas** via dialog modal
- 🗑️ **Remover colunas** com confirmação visual

### ✅ Gerenciamento de Cards

- ➕ **Adicionar cards** em qualquer coluna
- ✏️ **Editar cards** (título e descrição)
- 🗑️ **Remover cards**
- 🔄 **Mover cards** entre colunas via drag-and-drop (Angular CDK)

### ✅ Interface do Usuário

- 🎨 Design limpo e moderno com Angular Material
- 📱 Layout responsivo
- 🔔 Notificações toast para feedback ao usuário
- ⚡ Animações suaves e transições

### ✅ Experiência do Usuário

- 🖱️ Drag-and-drop intuitivo para reorganizar cards
- ⌨️ Validações de entrada
- 💾 Dados persistem durante a sessão (in-memory)

---

## 🧩 Desafios e Como Resolvi

### 🔧 Desafio 1: Gerenciamento de estado centralizado

**Problema**: Manter sincronização entre múltiplos componentes (board, columns, cards).
**Solução**: Centralizei toda a lógica de manipulação no `KanbanService`, garantindo uma única fonte de verdade. Os componentes apenas delegam ações ao serviço.

### 🔧 Desafio 2: Implementação de Drag-and-Drop

**Problema**: Criar uma experiência fluida de arrastar e soltar cards entre colunas.
**Solução**: Utilizei o Angular CDK Drag-and-Drop, que oferece suporte nativo e performático. Implementei os eventos `cdkDropListDropped` para detectar mudanças de coluna e atualizar o estado via `KanbanService`.

### 🔧 Desafio 3: Validação e Feedback ao Usuário

**Problema**: Garantir que o usuário não crie cards ou colunas vazias.
**Solução**: Implementei validações nos componentes e adicionei notificações toast usando TypeScript Toastify para feedback visual imediato.

---

## ✨ Melhorias Futuras

### ✅ Melhorias Simples

- 📅 **Adicionar campo de data de criação** aos cards
- 🔍 **Criar filtros e ordenação** por colunas
- 💾 **Salvar dados em localStorage** para persistência entre sessões
- 🎨 **Temas personalizáveis** (claro/escuro)
- 🏷️ **Tags e categorias** para cards
- 👥 **Atribuição de responsáveis** aos cards

### 🚀 Melhorias Avançadas

- 🔐 **Autenticação de usuários** (Firebase, Auth0)
- 🗄️ **Backend com API REST ou GraphQL** (NestJS, Express)
- 🗃️ **Banco de dados** (PostgreSQL, MongoDB)
- 📊 **Dashboard com métricas** e estatísticas
- 🔔 **Notificações em tempo real** (WebSockets)
- 📱 **Progressive Web App (PWA)** para uso offline
- 🧪 **Testes unitários e E2E** completos (Jasmine, Karma, Cypress)

### 🎯 Melhorias de UX/UI

- ✨ **Animações mais elaboradas** nas transições
- 🎨 **Customização de cores** por coluna
- 📋 **Arrastar para reordenar colunas**
- 🔄 **Desfazer/Refazer ações** (Ctrl+Z)
- ⌨️ **Atalhos de teclado** para ações rápidas

---

## 🛡️ Segurança e Testes

### Segurança

- ✅ Validações de entrada em todos os formulários
- ✅ Sanitização de dados via Angular
- ✅ Estrutura preparada para implementação de autenticação

### Testes

- 🧪 **Estrutura preparada** para testes unitários (Jasmine + Karma)
- 🧪 **Possível expansão** para testes E2E (Cypress, Playwright)
  Para executar os testes unitários:

```bash
ng test
```

---

## 📚 Scripts Disponíveis

```bash
# Rodar o projeto
ng serve
# Compilar para produção
npm run build
# ou
ng build
# Executar testes unitários
npm test
# ou
ng test
# Executar testes em modo watch
npm run watch
# ou
ng build --watch --configuration development
```

---

## 🎨 Personalização

### Estilos Globais

Os estilos globais estão em `src/styles.scss`. Você pode personalizar:

- Paleta de cores
- Tipografia
- Espaçamentos
- Animações

### Componentes

Cada componente possui seu próprio arquivo SCSS para estilos específicos:

- `board.scss` - Estilos do quadro principal
- `column.scss` - Estilos das colunas
- `card.scss` - Estilos dos cards

---

## 📖 Aprendizados

Durante o desenvolvimento deste projeto, aprendi:

- 🎯 **Arquitetura de componentes** no Angular
- 🔄 **Programação reativa** com RxJS
- 🎨 **Angular Material** e seus componentes
- 🖱️ **Drag-and-drop** com Angular CDK
- 📦 **Dependency Injection** e serviços
- 🎭 **TypeScript** avançado e interfaces
- 🎨 **SCSS** e organização de estilos
- 🧪 **Estrutura de testes** no Angular

---

## 🙏 Agradecimentos

- **Field** - Pela oportunidade de aprendizado

---

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através do GitHub.

- **Otavio Henrique Fachin** - [GitHub](https://github.com/otaviohenriquefachin)
- **Email** - otaviofachin25@gmail.com
- **Telefone** - (17) 99660-2122

---

**Desenvolvido com muito aprendizado por Otavio Henrique Fachin**

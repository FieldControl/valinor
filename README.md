# 📌 Projeto Kanban - Desafio Técnico

Este repositório contém a solução do desafio técnico de Kanban, utilizando **Angular** no frontend e **NestJS** no backend.

## 🧠 Sobre o Projeto

O sistema Kanban permite criar tarefas (cards) com nome, descrição, data e categoria, organizando-as em três colunas de status:  
🟡 **Pendente** | 🔵 **Fazendo** | 🟢 **Finalizado**  
Também é possível mover cards entre colunas, editar e excluir tarefas.

---

## ⚙️ Tecnologias Utilizadas

### Backend
- [NestJS](https://nestjs.com/)
- TypeScript
- Node.js

### Frontend
- [Angular](https://angular.io/)
- TypeScript
- HTML + CSS

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Angular CLI instalado

### Backend
cd backend
npm install
npm run start
O backend estará rodando em: http://localhost:3000

### Frontend
cd frontend
npm install
ng serve
O frontend estará rodando em: http://localhost:4200

### ✅ O que foi feito
Estruturação completa do backend com NestJS

Validações para status e existência de cards

Implementação das funcionalidades exigidas pelo desafio

Frontend conectado com backend e funcionalidades visuais básicas

Componentização com Angular Standalone Components


### 📂 Estrutura do Projeto
📁 backend
  └── src/
      └── kanban/
          ├── dto/
          ├── kanban.controller.ts
          ├── kanban.service.ts
          ├── kanban.module.ts
📁 frontend
  └── src/
      └── app/
          └── componentes/

### 💭 Decisões Técnicas
NestJS + Angular: por serem os frameworks exigidos no desafio, com estrutura modular e suporte robusto.

Armazenamento em memória: simples e direto para o escopo do desafio.

Sem Tailwind ou bibliotecas externas de UI: para manter o código limpo e próximo do que foi pedido.

### 🧪 Testes
Testes automatizados podem ser incluídos para melhorar a cobertura e garantir o funcionamento do sistema em alterações futuras.

### 📄 Documentação da API
Método	Rota	        Descrição 
GET	    /cards	        Lista todos os cards
POST	/cards	        Cria um novo card
PUT	    /cards/:id	    Atualiza um card
PATCH	/cards/:id/move	Move card de coluna
DELETE	/cards/:id	    Remove um card

### 🌱 Contribuições Pessoais
Este foi meu primeiro contato prático com várias tecnologias do ecossistema web, como:

HTML

CSS

JavaScript

TypeScript

Angular

NestJS

Durante o desafio, aprendi sobre a estrutura de projetos Angular/NestJS, comunicação entre frontend e backend, boas práticas REST, manipulação de estado no frontend e como estruturar código de forma organizada e reutilizável.

Foi um projeto muito desafiador, mas com grande valor de aprendizado. Consegui desenvolver lógica, resolver bugs e estruturar um sistema funcional do zero.

### 💡 Possíveis Melhorias Futuras
Integração com banco de dados (atualmente os dados estão em memória)

Ajustes de layout

Adição de testes unitários e E2E

Deploy da aplicação

WebSocket para atualizações em tempo real

Suporte a GraphQL

### 📬 Contato
Caso tenha qualquer dúvida ou sugestão, entre em contato pelo e-mail: henriquecaliarifuzeto@outlook.com

### 🧑‍💻 Respostas ao Repositório

# Quais ferramentas e bibliotecas você usou?
NestJS, Angular, TypeScript, HTML, CSS

# Por que optou por essas tecnologias?
Elas foram definidas no desafio e são ferramentas modernas, com grande uso no mercado. Serviram como uma ótima introdução ao desenvolvimento web.

# Quais princípios de engenharia de software você usou?
Organização em camadas, separação de responsabilidades, nomenclatura semântica, reutilização de código.

# Desafios que enfrentou e como resolveu:

Integração frontend/backend: resolvi testando pelo Insomnia/console.

# Manipulação de estado: utilizei arrays locais e funções específicas por coluna.

Validação de status: criei um enum e filtros para garantir integridade.

# O que pode ser melhorado?
Persistência em banco de dados, testes automatizados e integração contínua. O próximo passo é aprofundar em testes e deployment.

✨ Obrigado pela oportunidade! Foi um desafio incrível para aprender na prática. 💪
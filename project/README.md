# 📋 Kanban Board Fullstack

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge&logo=appveyor)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

> Um sistema de gerenciamento de tarefas visual (estilo Trello) desenvolvido para demonstrar a integração completa entre um Frontend moderno e uma API robusta.

---

## 🖼️ Preview

*(Adicione aqui uma imagem ou GIF do projeto funcionando)*

---

## 🚀 Sobre o Projeto

Este projeto é uma aplicação **Fullstack** que implementa um quadro Kanban. O objetivo foi criar uma arquitetura limpa onde o Frontend consome uma API RESTful, com persistência de dados relacional.

**Principais desafios resolvidos:**
* Sincronização de estado entre componentes pais e filhos.
* Implementação de **Drag & Drop** utilizando Angular CDK.
* Formulários semânticos e interativos (substituindo o uso de `alerts/prompts`).
* Configuração de ambiente Monorepo (Backend e Frontend no mesmo repositório).
* Testes unitários no Backend.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend** (`/frontend`)
- **Angular 17+** (Standalone Components)
- **Angular CDK** (Para a funcionalidade de arrastar e soltar)
- **HTML5 & CSS3** (Layout responsivo e estilização customizada)
- **TypeScript**

### **Backend** (`/backend`)
- **NestJS** (Framework para Node.js)
- **TypeORM** (ORM para banco de dados)
- **PostgreSQL** (Banco de dados relacional)
- **Jest** (Testes automatizados)

---

## ✨ Funcionalidades

- [x] **Gestão de Colunas**: Criar e excluir colunas dinamicamente.
- [x] **Gestão de Tarefas (Cards)**: Adicionar cards com título e descrição.
- [x] **Drag & Drop**: Arrastar cards entre colunas diferentes.
- [x] **Interface Limpa**: Inputs inline para criação rápida de tarefas (sem popups intrusivos).
- [x] **Persistência**: Dados salvos automaticamente no PostgreSQL.

---

## 📦 Como Rodar o Projeto

### Pré-requisitos
Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 1. Clonar o Repositório

```bash
git clone [https://github.com/SEU-USUARIO/NOME-DO-REPO.git](https://github.com/SEU-USUARIO/NOME-DO-REPO.git)
cd NOME-DO-REPO

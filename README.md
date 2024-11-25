# **Sistema de Kanban**

## **1. Introdução**
Este projeto é um sistema de Kanban que desenvolvi como parte de um desafio técnico para uma vaga de desenvolvedor full-stack (estagiário). O sistema permite a criação, gerenciamento e organização de tarefas em um formato visual, utilizando colunas e cartões, como em frameworks de produtividade amplamente utilizados.

---

## **2. Funcionalidades**
* **Gerenciamento de Colunas**:
  * Adicionar, listar e excluir colunas.
* **Gerenciamento de Cartões**:
  * Adicionar, editar, mover e excluir cartões entre colunas.
* **Arrastar e Soltar**:
  * Implementação de drag-and-drop para mover cartões entre colunas.
* **Interface Intuitiva**:
  * Modal para edição detalhada de tarefas.
* **Persistência de Dados**:
  * API conectada a um banco de dados relacional.

---

## **3. Ferramentas e Bibliotecas Utilizadas**

#### **Frontend**
* **Angular**:
  * Framework SPA para construir a interface do usuário.
  * Optei por Angular devido ao suporte robusto para projetos escaláveis e integração fácil com ferramentas como TypeScript.
* **Angular Material**:
  * Para componentes visuais modernos.
* **@angular/cdk/drag-drop**:
  * Para implementar o recurso de arrastar e soltar.

#### **Backend**
* **NestJS**:
  * Framework modular e escalável baseado em TypeScript.
  * Escolhi NestJS por sua estrutura inspirada no Angular e suporte integrado ao TypeORM.
* **TypeORM**:
  * ORM utilizado para interagir com o banco de dados.
* **SQLite**:
  * Banco de dados leve e fácil de configurar para o ambiente de desenvolvimento.

#### **Testes**
* **Frontend**:
  * Jasmine e Karma: Para testes unitários no Angular.
* **Backend**:
  * Jest: Para testes unitários no NestJS.
  * Supertest: Para testes de integração de APIs.

#### **Outras Ferramentas**
* **Git**:
  * Controle de versão.
* **Visual Studio Code**:
  * IDE para desenvolvimento.

---

## **4. Por que Escolhi estas Tecnologias?**
* **Angular**:
  * Fortemente tipado com TypeScript, ajudando na detecção de erros em tempo de desenvolvimento.
  * Modularidade e escalabilidade.
* **NestJS**:
  * Estrutura baseada em módulos que facilita a separação de responsabilidades no backend.
  * Facilidade para testes e integração com bibliotecas modernas.
* **TypeORM**:
  * Simplifica as operações de banco de dados e permite trabalhar diretamente com objetos no TypeScript.

Outras opções, como React (no frontend) e Express (no backend), foram consideradas, mas optei por Angular e NestJS devido à consistência e sinergia entre os dois frameworks, facilitando o desenvolvimento full-stack.

Vale ressaltar que a empresa pediu para que o kanban fosse feito com Angular e NestJS.

---

## **5. Princípios de Engenharia de Software Utilizados**
* **SOLID**:
  * A organização do backend segue o princípio de responsabilidade única (cada serviço tem uma única responsabilidade).
* **Modularidade**:
  * Separação clara de responsabilidades no NestJS e Angular.
* **DRY (Don't Repeat Yourself)**:
  * Reaproveitamento de código em serviços e componentes.
* **Test-Driven Development**:
  * Testes unitários e integração foram escritos para validar os serviços e controladores.

---

## **6. Desafios e Soluções**

### **6.1 Integração do Drag-and-Drop**
* **Desafio**: Integrar o recurso de drag-and-drop de maneira fluida no Angular sem interferir na usabilidade.  
* **Solução**: Utilizei a biblioteca `@angular/cdk/drag-drop`, que oferece eventos pré-construídos para arrastar e soltar, reduzindo a complexidade da implementação manual.

### **6.2 Testes Unitários**
* **Desafio**: Configurar repositórios mockados no TypeORM para o NestJS.  
* **Solução**: Usei `jest.spyOn` para mockar os métodos de repositório (`find`, `create`, `save`, etc.), simulando o comportamento esperado em um ambiente de teste.

### **6.3 Backend API Simples, mas Funcional**
* **Desafio**: Criar um backend funcional com recursos limitados e um tempo reduzido.  
* **Solução**: Optei por SQLite no desenvolvimento local e garanti uma estrutura modular que pode ser facilmente adaptada para bancos relacionais mais robustos, como PostgreSQL.

---

## **7. O Que Pode Ser Melhorado**
* **Autenticação e Autorização**:
  * Atualmente, o sistema não implementa autenticação. Adicionar JWT para autenticação e controle de usuários é um próximo passo importante.
* **Testes End-to-End (E2E)**:
  * Embora testes unitários e de integração tenham sido implementados, adicionar testes E2E com Cypress garantiria uma melhor cobertura do sistema.
* **Estilização e Responsividade**:
  * O design atual é funcional, mas poderia ser melhorado para uma experiência de usuário mais refinada, especialmente em dispositivos móveis.
* **Suporte a Dados em Tempo Real**:
  * Usar WebSockets para permitir que múltiplos usuários vejam atualizações em tempo real no board.
* **Deploy e CI/CD**:
  * Implementar pipelines automatizados com ferramentas como GitHub Actions para deploy contínuo.

---

## **8. Como Executar o Sistema**

### **Pré-requisitos**
* Node.js instalado.
* Gerenciador de pacotes `npm`.
* Angular CLI instalado.

### **Passo 1: Clonar o Repositório**
```bash
git clone https://github.com/heitorrsdev/valinor.git
```
### **Passo 2: Configurar o Backend**
1. Entre na pasta do backend:
```bash
cd .\valinor\KanbanBoard\kanban-backend\
```
2. Instale as dependências:
```bash
npm install
```
3. Execute o backend:
```bash
npm run start
```
### **Passo 3**: Configurar o Frontend
1. Entre na pasta do frontend:
```bash
cd ..\kanban-frontend\
```
2. Instale as dependências:
```bash
npm install
```
3. Execute o frontend:
```bash
ng serve
```
### **Passo 4**: Executar Testes
* Frontend
```bash
ng test
```
* Backend
```bash
npm run test
```
### **Passo 5**: Acessar o servidor local:

Entre em seu navegador acesse a seguinte URL: http://localhost:4200
## 9. Contato
Criado por: Heitor Rosa da Silva

E-mail: heitorrs.dev@gmail.com

LinkedIn: https://www.linkedin.com/in/heitor-rosa-8233022a9/

Se tiver dúvidas ou sugestões, fique à vontade para entrar em contato! 🙂


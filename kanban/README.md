# **Sistema de Kanban**

## **1. Introdução**


---

## **2. Funcionalidades**
* **Gerenciamento de Colunas(CRD)**:
  * Adicionar, listar e excluir colunas.
* **Gerenciamento de Cartões(CRUD)**:
  * Adicionar, editar, mostrar, mover e excluir cartões entre colunas.
* **Persistência de Dados**:
  * Uso de TypeORM para conectar ao PostgreSQL.

---

## **3. Ferramentas e Bibliotecas Utilizadas**

#### **Frontend**
* **Angular**:
  * Como pedido pelas instruções de desenvolvimento do projeto foi optado o Angular. Me encantei pela facilidade em desenvolver o frontend devido à sua integração nativa com TypeScript e pela clareza na estrutura dos componentes, o que facilitou bastante a organização do projeto. Por mais que realizei somente uma organização de componentes
* **Uso do angular**:
  * Desenvolvi os componentes e serviços da aplicação de, garantindo escalabilidade e manutenção facilitada.


#### **Backend**
* **NestJS**:
  * Como pedido pelas instruções de desenvolvimento do projeto foi optado o NestJS por ser um framework robusto,esclável e simples.Escrito em TypeScript e com uma arquitetura modular que facilita a organização do código. Sua semelhança com o Angular também proporcionou uma curva de aprendizado mais suave.
  * Sua estrutura organizada facilita a criação de APIs REST, promovendo uma arquitetura limpa e reutilizável com os serviços. Além disso, o suporte nativo ao TypeORM torna a integração com o banco de dados ainda mais prática e eficiente.
* **TypeORM**:
  * ORM utilizado para criar e manipular o meu banco de dados no PostgreSQL.
* **PostgreSQL**:
  * Meu SGBD escolhido por ter mais facilidade com ele, por estar junto no meu dia a dia de desenvolvimento, por ter experiência e é claro,  Software Livre!.

#### **Testes**
* **Frontend**:
  * Ferramentas como o Jasmine e Karma configuradas automaticamente ao criar um projeto Angular com o CLI. Os arquivos de teste (.spec.ts) são gerados junto com componentes e serviços. O comando ng test executa os testes em modo watch, permitindo que os testes sejam reexecutados automaticamente a cada alteração no código.
* **Backend**:
  * Foi utilizado o framework de testes JEST que é integrado ao NestJS, com suporte a testes unitários e ótima performance. Os arquivos .spec.ts são gerados automaticamente ao criar serviços ou controladores pelo Nest CLI. Com npm run test:watch, os testes são executados continuamente a cada mudança no projeto.

#### **Outras Ferramentas**
* **Git**:
  * Controle de versão.
* **Visual Studio Code**:
  * IDE para desenvolvimento.

---

## **4. Por que Escolhi estas Tecnologias?**
* **Angular**:
  *  Utiliza TypeScript, o que permite uma tipagem forte e detecção de erros em tempo de desenvolvimento.
  *  Oferece uma estrutura modular e escalável, ideal para aplicações de médio e grande porte.
  *  Possui excelente suporte a ferramentas modernas.
* **NestJS**:
  * Framework baseado em módulos, o que favorece a separação de responsabilidades e uma arquitetura limpa.
  * Integra-se facilmente com ferramentas como TypeORM e bibliotecas de testes.
  * Inspirado no Angular, o que garante sinergia entre frontend e backend
* **TypeORM**:
  * Permite mapear modelos para tabelas de banco de dados usando classes TypeScript.
  * Facilita a realização de operações como CRUD, sem a necessidade de escrever SQL manualmente.

## **5. Princípios de Engenharia de Software Utilizados**
* **SOLID**:
  * A organização do backend segue o princípio de responsabilidade única (cada serviço tem uma única responsabilidade).
* **Modularidade**:
  * Ambos os frameworks com suas respectivas funções atribuídas.
* **DRY (Don't Repeat Yourself)**:
  * Reaproveitamento de código utilizando services, modules e componentes.
* **Test-Driven Development**:
  * Testes unitários e integração gerados pelas bibliotecas de testes dos respectivos frameworks.

---

## **6. Desafios e Soluções**

### **6.1 Integração do Drag-and-Drop**
* **Desafio**: Integrar o recurso de drag-and-drop de maneira fluida no Angular sem interferir na usabilidade.  
* **Solução**: Utilizei a biblioteca `@angular/cdk/drag-drop`, que oferece eventos pré-construídos para arrastar e soltar, reduzindo a complexidade da implementação manual.

mockar os métodos de repositório (`find`, `create`, `save`, etc.), simulando o comportamento esperado em um ambiente de teste.

### **6.3 Backend API Simples, mas Funcional**
* **Desafio**: Criar um backend funcional com recursos limitados e um tempo reduzido.  
* **Solução**: Optei por SQLite no desenvolvimento local e garanti uma estrutura modular que pode ser facilmente adaptada para bancos relacionais mais robustos, como PostgreSQL.

---

## **7. O Que Pode Ser Adicionado e Ajustado**
* **Autenticação e Autorização**:
  * Aplicar segurança colocando login e protegendo nossas rotas com JWT, seria uma boa prática
* **Testes End-to-End (E2E)**:
  * Aplicar testes E2E com ferramentas como o Cypress traria uma cobertura mais ampla e realista do funcionamento da aplicação em diferentes cenários..
* **Estilização e Responsividade**:
  * O design da aplicação ainda está simples e pode ser aprimorado com melhorias visuais e adaptação responsiva para diferentes dispositivos.
* **Suporte a Dados em Tempo Real**:
  * Usar WebSockets para permitir que diversas resposta sejam geradas ao cliente de maneira automática.A implementação de WebSockets permitiria atualizações em tempo real, melhorando a experiência do usuário ao refletir mudanças automaticamente na interface sem a necessidade de recarregar a página.
* **Deploy e CI/CD**:
  * A criação de pipelines automatizadas com ferramentas como GitHub Actions pode agilizar o processo de deploy contínuo, garantindo consistência e eficiência nas atualizações do sistema
* **Containers**
  * Como uma das maneiras de melhorar a performance, a segurança e realizar mitigação de problemas. Utilizar Docker e seus paradigmas para que o usuário tenha mesma experiência, sem problemas de funcionamento por conta de Sistema Operacional ou Navegador.
---

## **8. Como Executar o Sistema**

### **Pré-requisitos**
* Node.js instalado.
* Gerenciador de pacotes `npm` ou `yarn`, o de sua preferência, porém aqui será usado o `npm`.
* Angular CLI instalado.

### **Passo 1: Clonar o Repositório**
```bash
git clone https://github.com/andrepinotti/valinor.git
```
### **Passo 2: Configurar o Backend**
1. Entre na pasta do backend:
```bash
cd .\valinor\KanbanMain\backend\
```
2. Instale as dependências:
```bash
npm install
```
4. Em seguida instale o pg para possibilitar o uso do postgreSQL
```
npm instal pg
```
3. Execute o backend:
```bash
npm run start
```
### **Passo 3**: Configurar o Frontend
1. Abra um outro terminal e entre na pasta do frontend:
```bash
cd .\valinor\KanbanMain\frontend\
```
2. Instale as dependências:
```bash
npm install
```
3. Execute o frontend:
```bash
ng serve
```
### **Passo 4**: Acessar o servidor local:

Entre em seu navegador acesse a seguinte URL: http://localhost:4200
### **Passo 5**: Executar Testes no back-end e no front-end
* Frontend
```bash
ng test
```
* Backend
```bash
npm run test
```

## 9. Contato
Autor: André Pinotti

Whatsapp: 17 99154-6089

E-mail: andrepinotti0@gmail.com

LinkedIn: https://www.linkedin.com/in/andre-pinotti/

Sugestões e críticas são muito bem-vindas!

# API - ClientKanban

A API do **ClientKanban** foi desenvolvida para gerenciar os dados relacionados às colunas e tarefas de um board interativo. Ela consiste em dois módulos principais e utiliza tecnologias modernas para oferecer um desempenho eficiente e flexível.

## 🚀 Módulos

### 📂 Coluna
- Gerencia as operações de criação, edição e exclusão de colunas.
- Permite o armazenamento e recuperação de informações estruturadas sobre as colunas do board.

### 🗂️ Tarefa
- Gerencia as operações de criação, edição, exclusão e movimentação de tarefas.
- Oferece suporte para alterar a ordem de prioridade das tarefas dentro de suas respectivas colunas.

---

## 🛠️ Tecnologias Utilizadas

### **NestJS**
- Framework utilizado para estruturar e organizar a API, garantindo modularidade e escalabilidade.

### **GraphQL**
- Proporciona uma comunicação eficiente e flexível entre o cliente e a API, permitindo consultas e mutações personalizadas.

### **Prisma ORM**
- Gerencia o acesso ao banco de dados com facilidade e eficiência, simplificando operações complexas e otimizando a produtividade.

### **SQLite**
- Banco de dados leve e simples, configurado para atender às necessidades do projeto sem a necessidade de instalação adicional.

---

## 🖥️ Como Executar

### 1️⃣ **Instalar dependências**
Antes de executar, certifique-se de instalar todas as dependências necessárias com o comando:

npm install

### 2️⃣ **Iniciar o servidor**
Para rodar o servidor da API, utilize:

npm run start:dev

A API estará disponível no endereço padrão: [http://localhost:3030/graphql](http://localhost:3030/graphql).

### 3️⃣ **Explorar a API**
Você pode explorar e testar os endpoints da API utilizando o playground do GraphQL acessível no endereço acima.

---

## 📖 Estrutura da API

O projeto foi desenvolvido com foco em modularidade e facilidade de manutenção. Ele inclui:
- **Módulos organizados:** Cada funcionalidade (coluna e tarefa) está encapsulada em um módulo independente.
- **Schemas bem definidos:** O uso de GraphQL assegura a clareza no design da API.
- **Integração com Prisma:** Simplifica as interações com o banco de dados SQLite, garantindo confiabilidade e desempenho.

Para mais informações sobre as tecnologias utilizadas, consulte suas respectivas documentações:
- [NestJS](https://nestjs.com/)
- [GraphQL](https://graphql.org/)
- [Prisma ORM](https://www.prisma.io/)
- [SQLite](https://sqlite.org/)

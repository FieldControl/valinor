# Projeto Fullstack com NestJS (Backend) e Angular (Frontend)

Este é um projeto básico Fullstack que utiliza **NestJS** para o backend e **Angular** para o frontend. O backend salva os dados localmente em um array, simulando um banco de dados simples.

---

## 🚀 Tecnologias Utilizadas

- **Backend:** [NestJS](https://nestjs.com/)
- **Frontend:** [Angular](https://angular.io/)
- **Gerenciador de pacotes:** npm

---

## 📁 Estrutura do Projeto

```plaintext
projeto-fullstack/
|-- backend/       # Backend com NestJS
|-- frontend/      # Frontend com Angular
|-- README.md      # Documentação do projeto
```

---

## 🛠️ Backend

O backend utiliza o **NestJS** para expor endpoints simples:

- **GET** `/tasks` - Retorna uma lista de tarefas.
- **POST** `/tasks` - Adiciona uma nova tarefa.

### Como Executar o Backend:

1. Acesse a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run start
   ```
4. O servidor estará disponível em: `http://localhost:3000`

---

## 🌐 Frontend

O frontend utiliza o **Angular** para consumir os endpoints do backend e exibir as tarefas.

### Como Executar o Frontend:

1. Acesse a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   ng serve
   ```
4. A aplicação estará disponível em: `http://localhost:4200`

---

## 🔗 Conexão entre Backend e Frontend

Certifique-se de que o backend está rodando na porta **3000**. O frontend irá consumir os dados do endpoint `http://localhost:3000/tasks`.

---

## 🏁 Executando o Projeto Completo

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run start
   ```
2. **Inicie o frontend:**
   ```bash
   cd frontend
   ng serve
   ```
3. Acesse a aplicação em **http://localhost:4200**.

---

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

---

## 📝 Licença
Este projeto está licenciado sob a **MIT License**.

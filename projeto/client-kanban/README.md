
# ClientKanban

**ClientKanban** é um aplicativo interativo para gerenciamento de tarefas, organizado em colunas e tarefas dentro de um board. A solução oferece uma interface clara e eficiente, proporcionando controle total sobre as atividades.

## 🚀 Funcionalidades

### 📂 Colunas
- **Cadastrar:** Adicione novas colunas no board.
- **Editar:** Atualize informações de colunas existentes.
- **Excluir:** Remova colunas que não são mais necessárias.

### 🗂️ Tarefas
- **Cadastrar:** Crie novas tarefas associadas a uma coluna.
- **Editar:** Modifique os detalhes das tarefas conforme necessário.
- **Excluir:** Delete tarefas que não são mais relevantes.
- **Mover:** Arraste tarefas entre colunas para reorganizá-las.
- **Ordenar:** Altere a prioridade das tarefas dentro de uma coluna.

---

## 🛠️ Técnicas e Ferramentas Utilizadas

### ⚙️ **Ferramentas do Angular**
- **Observables e Subscribe:**  
  Utilizados para gerenciar fluxos de dados assíncronos, atualizando dinamicamente a interface com base em eventos ou respostas da API. Implementados com **RxJS** para garantir alta performance.

- **Apollo Client:**  
  Facilita a interação com a **API GraphQL**, proporcionando gerenciamento eficiente de estado e simplificando requisições e respostas.

- **Angular CDK (Component Dev Kit):**  
  Utilizado para funcionalidades nativas como **drag-and-drop**, garantindo uma experiência fluida e integrada.

- **Formulários Reativos:**  
  Implementados para validação e manipulação de dados, assegurando consistência e controle de estados nos formulários.

### 🖌️ **Componentização**
O projeto foi estruturado em componentes modulares e reutilizáveis, otimizando a manutenção, a escalabilidade e a reutilização de código.

---

## 🖥️ Como Executar

### 1️⃣ **Iniciar o servidor de desenvolvimento**
Para rodar o aplicativo localmente, utilize o comando:

ng serve

Abra o navegador e acesse: [http://localhost:4200](http://localhost:4200). As alterações feitas nos arquivos serão automaticamente refletidas no navegador.

### 2️⃣ **Compilar o projeto**
Para gerar a build do projeto, execute:

ng build

Os artefatos de build serão salvos na pasta `dist/`, otimizados para produção.

### 3️⃣ **Executar testes unitários**
Para rodar os testes unitários com o **Karma**, use:

ng test

---

## 📖 Estrutura e Navegação

Este projeto foi desenvolvido com **Angular 19.0.2**, integrando tecnologias como **PrimeNG**, **Apollo Client** e **Angular CDK**. A interface foi projetada para ser intuitiva, priorizando produtividade e organização, com funcionalidades avançadas como drag-and-drop nativo para movimentação de tarefas.

Para mais informações e recursos adicionais, consulte a [documentação oficial do Angular CLI](https://angular.dev/tools/cli).

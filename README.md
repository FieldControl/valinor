
# Matheus Airon - Kanban - Field Control

## Projeto utilizando Angular, Nest JS, Postgree

### Inicialização do Backend:

1. **Criação do arquivo `.env`:**
   
   No diretório `backend-field-teste`, crie um arquivo `.env` com as seguintes variáveis de ambiente:
   
   ```env
    DATABASE_HOST=*seuhost*
    DATABASE_PORT=*suaporta*
    DATABASE_USER=*userdobanco*
    DATABASE_PASSWORD=*senhadobanco*
    DATABASE_NAME=*nomedobanco*
   ```
   Ainda neste diretório, `npm install` para instalação dos pacotes necessários (graphql, typeorm e apollo), 
   
   É necessária a criação de um banco de dados para a aplicação.

### Inicialização do Frontend:

1. **Instalar Dependências:**

No diretório do `frontend-field-teste`, execute `npm install` para instalar as dependências necessárias.

2. **Iniciar o Projeto:**

Após instalar as dependências de ambos projetos, no diretório `backend-field-teste`, execute: `npm start`, no diretório `frontend-field-teste` execute `ng serve`.


### Explicação das Abordagens:

1. A princípio, todo backend fazendo requisições graphql com seus respectivos mutations, existem dois principais módulos `card e coluna`, ambos possuem create, update e delete.

2. O frontend requisita ao banco através da aplicação Nest JS, todas requisições com apollo para facilitar as requisições e suas respostas. Os components atualizam em tempo real conforme necessário após uma criação ou edição.

### Próximos Passos:

1. Teste unitários possíveis: criar coluna, criar card, mover cards, apagar card e coluna e edição de ambos.

2. Drag and Drop nos cards.

3. Posição das Colunas e dos Cards.
   
   
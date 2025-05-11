
# Matheus Airon - Kanban - Field Control

## Projeto utilizando Angular, Nest JS, Postgree

### Inicialização do Backend:


1. **Criação do arquivo `.env`:**
   
   No diretório `backend-teste-field`, crie um arquivo `.env` com as seguintes variáveis de ambiente:
   
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

No diretório do `frontend-teste-field`, execute `npm install` para instalar as dependências necessárias.

2. **Iniciar o Projeto:**

Após instalar as dependências de ambos projetos, no diretório `backend-teste-field`, execute: `npm start`, no diretório `frontend-teste-field` execute `ng serve`.


### Explicação das Abordagens:

1. A princípio, todo backend fazendo requisições graphql com seus respectivos mutations, existem dois principais módulos `card e coluna`, ambos possuem create, update e delete.

2. O frontend requisita ao banco através da aplicação Nest JS, todas requisições com apollo para facilitar as requisições e suas respostas. Os components atualizam em tempo real conforme necessário após uma criação ou edição.


### Desafios e problemas:

1. Apesar de ter estudado um pouco sobre Angular, não tinha me aprofundado previamente como desta vez, tive um pouco de problema com a comunicação entre o Angular e o NestJS, mas que não foram um grande empecilho para o desenvolvimento.

2. Precisei conhecer e entender como o Nest JS funcionava e sua estruturação de arquivos/sintaxe. Outro ponto foi a comunicação com o Postgree, precisei pesquisar bastante para entender como as coisas se conectavam.


### Próximos Passos:

1. Teste unitários possíveis: criar coluna, criar card, mover cards, apagar card e coluna e edição de ambos.

2. Drag and Drop nos cards.

3. Posição das Colunas e dos Cards.


### Sobre Mim:

Sou nascido em São Paulo mas moro em Rio Claro desde pequeno, me considero Rio Clarense. Amo esportes e jogos eletrônicos, joguei League of Legends semi profissional e já fui vice-presidente da bateria universitária da UNESP Rio Claro.

Desde pequeno estou envolto do meio gamer, meu amor por tecnologia começou cedo, jogava Ragnarok e lembro que a primeira vez para fazer download demorou quase 3 dias (famosa internet discada), hoje vejo como tudo avançou e todo dia me surpreendo.
   
   
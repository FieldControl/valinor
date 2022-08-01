
## Projeto de consumo da API do github e retorno das informações.

O projeto foi feito em JavaScript e utiliza a biblioteca React.js e consiste em realizar uma chamada na api do github e obter informações de repositórios da linguagem desejada e então trazer para o front e apresentar para o usuário.

Utilizei o seguinte comando para criação do projeto:

```bash
npx create-react-app desafio-field-control
```

Utilizei a biblioteca Styled-components para estilização, também utilizei o react-icons para inserção de ícones na página e o jest para os testes

## Funcionalidades

A primeira funcionalidade que fiz foi fazer a chamada na api usando os parâmetros de linguagem, página e quantidades de tópicos por página, então usando a função setPaginacaoRepositorio armazenei todos os dados obtidos.

A segunda funcionalidade foi obter o resumo da linguagem digitada na busca, usando a api com os parametros de linguagem e quantidade por página usando a função setSobreLinguagem para armazenar as informações obtidas.

A Função atualizaPesquisa tem como objetivo quando chamada pelo botão do input, armazenar a informação digitada na área do input na constante linguagem, limpar o campo do input e atribuir o número um para a página assim o resultado que a api vai obter será sempre retornado da primeira página.

Função retornoLinguagem tem como função obter o parametro da linguagem que está definindo qual a linguagem predominante do script.

paginaAnterior quando chamada verifica se a constante página é maior que um e se caso true a função atribui a setPagina o valor atual da pagina menos um.

proximaPagina quando chamada verifica se página é maior ou igual a um e se o tamanho da páginação do repositório é igual a dez e se caso true ele adiciona um no valor atual da página.

## Link da API do github para obtenção dos repositórios:

[https://api.github.com/search/repositories?q=](https://api.github.com/search/repositories?q=)

## Link da API do github para obtenção sobre tópicos:

[https://api.github.com/search/topics?q=](https://api.github.com/search/topics?q=)

## Testes

Fiz o teste unitário dos botões da página( pesquisa, página anterior e página seguinte) e também para o input.

## Utilização

Para utilizar o projeto na sua máquina, faça o clone do projeto e então execute o comando a seguir para iniciar a sua aplicação:

```html
yarns install
yarn start
```
No navegador abra a url http://localhost:3000
## Sobre o projeto

O projeto realizado permite trazer 10 resultados da API github por vez através da paginação.
Também foi adicionado uma rota para que na busca seja possível procurar repositórios pela linguagem e retornar na tela. 
Ao clicar sobre algum repositório, o usuário será redirecionado para o projeto original.
Em cada repositório está tendo o retorno do nome, descrição, tópico, linguagem e data de criação.

## Para uso do projeto

Instale o Node.js;
Realize o clone do repositório;
Abra o arquivo no seu editor de código e instale as dependências necessárias, como o fontAwesome, por exemplo.
Inicie o arquivo através do terminal com ng serve e acesse através do endereço informado (http://localhost:4200)

## Qual ferramentas e bibliotecas foram usadas?

- Angular
- Rxjs para busca dos dados da Api do github
- Bootstrap apenas para estruturação do conteúdo
- Font awesome para ícones

## Quais princípios da engenharia de software que você usou?

Os módulos foram separados para que a lógica funcionasse de forma melhor e fosse melhor reaproveitado na leitura do código.
Foram utilizadas as boas práticas de programação de forma a ser fácil o entendimento de qualquer usuário que venha usá-lo.

## Desafios e problemas que você enfrentou e como você resolveu?

Durante o desenvolvimento várias vezes houve erro por questões do tokes de acesso da própria API, o que me forçou a reescrever o código para que o token não fosse necessário.

## O que você entende que pode ser melhorado e como fazer isso?

Acredito que seja possível deixá-lo 100% dinâmico, fazendo com que todos os filtros venham do servidor assim como a resposta ao selecionar um filtro e também pode ser feito a comunicação com o back-end para retorno do usuário logado, por exemplo.



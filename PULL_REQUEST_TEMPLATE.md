# Envio de solução

## Framework, linguagem e ferramentas

- **graphql-yoga** como servidor de graph ql
- **prisma2** framework de modelagem e acesso a dados
- **apolo-client** client side para consumir o servico
- **mysql** persistencia de dados
- **cross-spawn e npm** como ferramentas de desenvolvimento

## Técnologias X e Y

- **prisma framework** ouvi falar deste framework a um tempo e estava com vontade de experimenta-lo
- **mysql** pela experiencia e intimidade, uma escolha pessoal
- outras ferramentas foram pesquisadas e usadas de acordo com o necessário

## Desafios e problemas

Uma das maiores dificuldades foi usar uma biblioteca que não esta totalmente estável (prisma2) encontrei bastante problemas com a engine de migracao (aparentemente ela ainda não lida muito bem com o mysql no windows).

Isso estava atrapalhando a produtividade pois não conseguia alterar os modelos e aplicar as alterações até que chegou um ponto que decidi simplismente criar algo para apagar todo o schema da base de dados e comecar do zero novamente.

também tive dificuldade inicial por nunca ter inplementado nada em graphql no entanto fiquei impressionado com a quantidade de conteudo e documentação para a tecnologia.

## Melhorias e próximas implementações

- Atualmente o projeto tem um arquivo chamado seed.js que tenta de maneira singela ser um teste automatizado para o projeto
seria de estrema relevância adicionar mais testes automatizados usando um framework espesífico para isso.

- paginação

## Sobre você

Sou Leonardo, mas pode chamar de Leo.

Nascido e criado em Guapiaçu passei os últimos anos da minha vida em Rio preto estudando e trabalhando.

Me formei em Informática pra negócios em 2018 Na FATEC e trabalhei na Sifat como desenvolvedor desde então em 2020 não estava
contente no trabalho então decidi sair.

Já conhecia a field a um bom tempo e me interesei pela empresa poque gostei bastante do fluxo de tralhalho usando PR e pela filosofia de valorização do lado humano.

Comeceia a me interessar por TI por acidente, e acabei me dando muito bem com desenvolvimento, gosto de automatizar tarefas e criar ferramentas que facilitam  a vida  das pessoas.
Me considero uma pessoa tímida com extranhos porem extrovertida com amigos.

## Outros detalhes

O projeto se trata de uma api modesta para gerenciar pedidos de delyveri (tentei copiar algumas funcionalidades básicas do ifood).

[versão online](https://gql-leo.herokuapp.com/) do projeto com alguns dados de demonstração

queries e mutations de exemplo podem ser encontradas no arquivo

```file
utils/seed.ts
```

### Executando o projeto localmente

criar a variavel de ambiente `GQL_DATABASE_URL` com a string de conexao com o mysql de acordo com o exemplo

``` url
mysql://user:pass@host:port/database?reconnect=true
```

- **importante** a base de dados deve estar previamente criada.
- **importante** a base de dados tera **todas** suas tabelas removidas portanto o risco de **PERCA DE DADOS** é alto, use um banco vazio.

```shell
# instalar dependencias
npm install

# criar schema na base de dados
npm run drop-create

# iniciar o app
npm run start

# alimentar o banco de dados
npm run seed
````

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :)

- leonardo.falco@outlook.com
- (17) 98193-8155 (whats)

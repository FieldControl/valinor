# Entrega

O backend foi inspirado a partir do jogo de MOBA da Valve Dota 2, onde há mais de 100 herois em que se pode escolher para jogar, a API retorna o Nome do herói, seu tipo (que significa como o heroi se beneficia de itens), e se ele é um heroi que ataca a longo ou curto alcance.

- Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou
	
	Utilizei o webserver express, express-graphql, graphql, pg (usado para conectar com o postgres) e o axios para popular a tabela de herois de uma API de terceiros ao rodar a API pela primeira vez.

    Como banco de dados foi utilizado o Postgres.
	
	Para testar a API utilizei o REST client Insomnia.
- Porque você optou pela tecnologia X e não a Y
	Usei o express por ser um webserver de node bem simples e muito utilizado.
- Desafios e problemas que você enfrentou e como você resolveu.
	Praticamente tudo neste app foi um desafio, apesar de entender bem javascript, não domino o node, que é algo que quero que seja minha especialidade. Não tinha feito nenhuma API previamente, fui pesquisando e consegui fazer este desafio.

- O que você entende que pode ser melhorado e como fazer isso
	acredito que um sistema de autenticação por token, melhorar a estutura de arquivos,fazer um banco de dados com mais relações.

email: felipe.santos1504@outlook.com 17-988084541
[LinkedIn Felipe Santos](https://www.linkedin.com/in/felipecarlos1504/)

# App

Dar clone nesse Projeto e logo após `npm i` para instalar a última versão das dependências do app e iniciar o desenvolvimento.


Criar o banco de dados no Postgres com o comando abaixo: 

``
CREATE DATABASE db_dota WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;
``

Ao iniciar a API verifico se a tabela existe, caso não exista crio ela e populo ela consultando um API para inserir na mesma.

```
/**
 * Verifica se existe a tabela dos Heróis e consulta uma API para inseri-los na tabela caso a mesma não exista
 */
const setHeroes = async () => {

    try {
        await pool.query(`SELECT 1 FROM tb_heroes`);
    } catch (error) {
        await pool.query({
            text: `CREATE TABLE tb_heroes (
          sr_id SERIAL PRIMARY KEY,
          vc_name VARCHAR(30),
          vc_role VARCHAR(30),
          vc_type VARCHAR(30)
        );`
        })
        const results = await axios.get('https://api.opendota.com/api/heroes');
        results.data.forEach(async hero => {
            await pool.query({
                text: 'INSERT INTO tb_heroes (vc_name, vc_role, vc_type) VALUES ($1, $2, $3)',
                values: [hero.localized_name, hero.attack_type, hero.primary_attr]
            })
        })
        console.error(error);
    }

}
```

# Pool.js

edite o arquivo `pool.js` para que o app consiga conectar com o banco de dados:

```
const pool = new Pool({
    user: 'postgres', // seu usuário
    host: 'localhost', // endereço do seu banco no postgres
    database: 'db_dota', // deixar como está
    password: '', // senha se houver
    port: 5432, // porta em que está sendo servido o banco
});
```

## Rest Client

para testar a API utilizei o REST Client Insomnia, para importar os endpoints fazer o download do arquivo abaixo e importa-lo no insomnia para receber os endpoints da API:

[Environment Insomnia](https://drive.google.com/open?id=1cO_cTcfHDKqjGFa1AZw17Tkylx5UPLNq)
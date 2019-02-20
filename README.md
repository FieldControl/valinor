# Challenge: Backend Developer

Desenvolver uma API JSON RESTful em JavaScript expondo operações de um CRUD de Games.

### Pré-requisitos

- Versão node: `10.15.0`
``` 
nvm install 10.15.0
nvm use 10.15.0
```

- npm globals packages
```
npm install body-parser --save
npm install express --save
npm install --save-dev ava 
```

- MongoDB `2.2.33 `

```
npm install mongoose --save
```

**Obs:** O arquivo de configuração do banco, localiza-se em src/config.js.

**Se for executar os testes, trocar a URI para o banco de teste.**

### Instalação

```
npm install
```

### Testes

`npm test` irá popular o banco de dados de teste e executará os testes unitários.

# Execução 

`npm start` irá executar a api
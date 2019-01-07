## NOTAS DO PROJETO

### **O que foi desenvolvido**

O projeto desenvolvido é uma API de restaurantes que aceitam o ticket Alimentação. Esse recurso foi escolhido visando futuramente desenvolver uma lista pessoal de estabelecimentos que aceitam esse tipo de ticket.

### **Framework, linguagem e ferramentas**

Utilizei **Node.js (V8.12) + Express** como framework backend. Para o banco de dados utilizei o [mLab](https://mlab.com) uma plataforma DBaaS para o **MongoDB (V3.6.9)**. E para o desenvolvimento foi utilizado o Vs Code.

### **Técnologias X e Y**

A escolha de todas tecnologias apresentadas na resolução desse desafio tem como foco a aprendizagem. Como nunca havia trabalhado com elas, pensei em tentar utiliza-las para realmente me desafiar e aprender.

Em específico o Express foi escolhido por ser um dos frameworks backend mais populares javascript, o que torna fácil encontrar soluções para possíveis problemas que posso enfrentar ao longo do desafio.

Já o MongoDB foi escolhido por ter uma maior compatibilidade com o Node.js uma vez que que sua estrutura de dados é muito semelhante ao JSON. Além disso, o MongoDB tem esquemas dinâmicos, possibilitando assim eu alterar a estrutura do banco sem muita dificuldade, o que não ocorre em bancos SQL. 

Ao longo do projeto utilizei algumas bibliotecas para auxiliar no desenvolvimento, tais como:

 - [Mongoose](https://www.npmjs.com/package/mongoose) como ferramenta de modelagem para o MongoDB;

 - [ExpressValidator](https://express-validator.github.io/) para realizar a sanitização das rotas de POST, PUT e PATCH; 

 - [Dotenv](https://www.npmjs.com/package/dotenv) para poder carregar no `process.env` todas as variaveis de ambientes localizadas no arquivo de configuração(variables.env); 

 - [BodyParser](https://github.com/expressjs/body-parser) Para realizar o parser das informações contidas no corpo das requisições;

 - [Mocha](https://mochajs.org/) Framework para realizar testes assincronos;
 
 - [Chai](https://www.chaijs.com/) Para conseguir realizar os asserts dos testes implementados.

### **Desafios e problemas**

Um dos principais desafios foi estruturar os arquivos de modo que a arquitetura da aplicação ficasse separada por camadas e cada uma com responsabilidade diferente no projeto. A maneira que encontrei de solucionar esse problema foi pesquisando como aplicar alguns padrões que já conheço (MVC + Services) no Node.js. Tive também uma certa dificuldade em utilizar o MongoDB e criar os testes de integração, mas com a documentação e um pouco de video aulas consegui solucionar meus problemas.

### **Melhorias e próximas implementações**

Acredito que uma possível melhoria nesse projeto talvez seja a adição do Typescript, pois o superset pode facilitar o uso de boas práticas (fácil criação de interfaces), além de ter tipagem de dados estática, o que na minha opinião, diminui os riscos de bugs no sistema. 

---

email: lf.silva@outlook.com
tel: (17) 99173-7810 ou (17) 3217-2707




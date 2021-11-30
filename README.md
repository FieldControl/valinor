# git-search

### Uma página em React para consultar repositórios do Github

## Uso
Execute `npm install` na pasta do projeto onde fica o package.json para instalar as dependências do projeto, em seguida execute `npm start` para a aplicação abrir em http://localhost:3000

Os resultados são mostrados em formato cards com paginação de 10 itens por página, como a API do github só mostra os primeiros 1000 resultados, então não é mostrado páginas acima de 100. 

Ao clicar em um card você é redirecionado ao repositório do Github referente ao card, existem outros links na página como o criado e a contagem de issues que também redirecionam ao Github.

Também existem alguns tipos de ordenações como quantidade de estrelas, forks e etc...

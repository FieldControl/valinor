## Envio de solução

Para o desenvolvimento, primeiro foquei em entender a Api do Github e fazer os requests necessários, depois fiz os ajustes utilizando css e bootstrap para adicionar os elementos a página de forma organizada; adicionei os tópicos e outras informações vindas da Api e por fim implementei o sistema de paginação, limitando a 100 páginas assim como no site do Github.

**Framework, linguagem e ferramentas**

Utilizei Visual Studio Code, Html, Css, Bootstrap, Javascript e AngularJs.
A biblioteca angular-sanitize foi utilizada para adicionar as descrições com emojis em cada repositório.

**Técnologias X e Y**

Optei pelo AngularJs pois estou mais familiarizado com este framework.
Sobre a Api do Github, optei por não utilizar a biblioteca Octokit, uma vez que seria necessário autenticação para enviar os requests, o que não era desejado neste caso onde é apenas uma aplicação de busca de repositórios.

**Princípios de software**

A aplicação foi dividida em diferentes arquivos e módulos para melhor organização e manutenção.
As funções foram feitas de forma a serem reutilizadas se necessário.
Para adicionar os emojis a cada descrição, optei por realizar um pré-processamento em todas as descrições vindas da Api antes de serem levadas a página, para que não fosse necessário chamadas adicionais de funções.

**Desafios e problemas**

Durante o desenvolvimento fiz pesquisas para entender a Api do Github, pesquisas de Css para ajustar os elementos da lista, além da biblioteca angular-sanitize da qual não possuía conhecimento, para adicionar html utilizando Angular.

**Melhorias e próximas implementações**

O sistema de paginação está realizando outra chamada da Api e atualizando as informações na lista, porém como a Url continua a mesma não é possível salvar a pesquisa na página atual. Isto poderia ser resolvido alterando o modo como a página está sendo carregada para trabalhar com a Url.

Adicionar mais parâmetros na busca e ordenação das informações dos resultados (Best match / Most stars /...)

**Sobre você**

Meu nome é Tiago Olivares da Silva, nasci e moro em São José do Rio Preto, sempre gostei muito de tecnologia, portanto decidi fazer faculdade em Ciências da Computação. Me formei no final de 2022 na Unip em SJRP/SP, realizando estágio no ultimo ano na empresa Empro - Tecnologia e informação, onde obtive muito conhecimento em prática na área de desenvolvimento web, trabalhando com Html, Javascript, AngularJs e Plsql; como a empresa possuía páginas padronizadas, não utilizei muito Css, portanto este ainda é um ponto ao qual busco melhorar. Utilizávamos Jira e Gitlab para versionamento e desenvolvimento rápido.
No momento estou estudando hacking em aplicações web através de um curso, para aprender sobre vulnerabilidades e melhorar meu desenvolvimento, além de reportar falhas às empresas.
Estou sempre buscando evoluir e gostaria muito de fazer parte do time de desenvolvimento da Field Control!

**Contatos**

Email: Tiago-riopreto@hotmail.com
Celular: +55 (17) 99682-5564


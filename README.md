# GitHub Repository Search
Olá, seja bem vindo(a)!

Este projeto se trata de uma SPA de busca de repositórios utilizando a API do GitHub, JavaScript e Json.
O objetivo desse projeto é a aplicação para vaga de estágio de desenvolvedor front-end na <a href="https://github.com/FieldControl" title="Field Control" target="_blank">Field Control</a>. 
<br>

## Tecnologias utilizadas
#### HTML e CSS
O documento HTML foi feito pensando na semântica, SEO e acessibilidade. O CSS foi feito pensando num layout agradável, com fácil visualização e responsivo

#### JavaScript e Json
Optei por utilizar apenas javascript e Json pois ainda estou no processo de aprendizagem de Angular e Rest API.

## Boas Práticas e Recursos
- Código limpo e organização
- Documentação de código
- Documentação do projeto (README)

### Semântica e SEO
- Todas as tags forma pensadas para otimização do SEO da página
- Atributos semânticos como title, name e alt foram utilizados em todo o documento

### Acessibilidade
- O recurso de tabindex em ordem foi atribuido aos menu de navegação
- Os elementos html tem atributos de name e title
- Cada resultado de pesquisa tem atributos de name e title exclusivos em seus elementos 
- As imagens tem um atributo alt descritivo

### Responsividade
- Todo o conteúdo da página tem tamanhos relativos ao tamanho da fonte do body (rem)
- Nenhum objeto da página tem tamanho fixo
- Foi preciso a utilização de 2 media queries, uma para telas de até 600px e outra para telas de até 500px
- Quando o tamanho da tela for menor que 600px o tamanho da fonte do body diminui e todos os elementos da página são redimensionados, o footer é justificado ao centro e a tag do criador recebe novos estilos para facilitar a leitura e melhorar a experiência do usuário
- Quando o tamanho da tela for menor que 500px o tamanho da fonte do body diminui novamente, redimensionando o tamanho dos elementos da página, o campo de pesquisa recebe um display block e um alinhamento central 

### Otimização 
- A maior parte do documento HTML é conteúdo de texto
- No HTML todas as tags estão sendo utilizadas
- No CSS foram utilizados apenas seletores de grandes blocos (body, header e footer) e classes específicas
- Foram utilizadas apenas 3 midias na página (logo do GitHub como link para home page e favicon, e icone de pesquisa)
- As midias utilizadas são SVG
- No JavaScript forma utilizadas apenas 3 variáveis, sendo uma global para a url da API e outras 2 de escopo, uma para a query do usuário e outra para a array de resultados
- No JavaScript também foram utilizadas apenas 4 funções, sendo uma utilizada como controle das demais 

### Testes 
- Realizei testes pelo input de pesquisa e no console

## Desafios Enfrentados
- Gostaria muito de ter utilizado REST API nesse projeto, mas ainda estou em processo de aprendizado
- Também senti dificuldades para fazer a paginação então deixei sem
- A primeira versão da aplicação apresentava muita demora de carregamento pois tentei fazer um mapeamento completo dos resultados num unico objeto, para resolver o problema resolvi mapear os resultados com apenas as informações relevantes para o projeto.

## Possíveis Melhorias
- Realizar a paginação dos resultados
- Input de pesquisa com live search
- Filtros de pesquisa
- Utilização de Rest API
- Implementação de testes 
- Adicionar informações relevantes aos resultados

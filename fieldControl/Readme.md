# Especificações do projeto

## Sobre o projeto

* ### Escolha do projeto
    <p>Para a criação do projeto em Ionic, utilizei o framework Angular e o Ionic Framework, que é baseado no Angular. Além disso, também utilizei o TypeScript para desenvolver o código, que permite o uso de tipagem estática e uma melhor organização do código.</p>

* ### Motivo da escolha
    <p>A escolha pelo Ionic foi feita por conta da facilidade de desenvolvimento de aplicativos móveis com um design moderno e interativo. Além disso, o Ionic oferece suporte a diversos plugins e bibliotecas que podem ser integrados com facilidade.</p>
* ### Princípios de engenharia de software
    <p>Ao desenvolver o projeto, utilizei alguns princípios da engenharia de software, como a separação de responsabilidades em diferentes componentes, a utilização de módulos para organizar o código e a utilização de boas práticas de programação para manter o código limpo e legível.</p>
* ### Dificuldades
    <p>Durante o desenvolvimento, enfrentei alguns desafios como a integração de diferentes bibliotecas e a implementação de algumas funcionalidades específicas. Para resolver esses problemas, pesquisei a documentação oficial e recorri a fóruns e comunidades para buscar soluções. Um outro fator bastante relevante foi o tempo, pois fiquei com duvida sobre o que estava sendo pedido, então mandei um e-mail, infelizmente só fui respondido vesum dia antes de enviar o projeto, mas no fim deu para fazer o que estava pedido, não do jeito que eu queria que fosse, mas as principais funcionalidades foram empregadas. </p>

## Como instalar
### Para criar o projeto foi preciso rodar os seguintes comandos

* Inicializar o projeto

    ```bash
    $ npm install -g ionic cordova
    $ ionic start nomedoprojeto sidemenu --type=ionic-angular
    ```
* Criar novas paginas

    ```bash
    $ ionic generate page repositorio
    ```
* Execultando o projeto
    ```bash
    $ ionic serve
    ```
## Esquemático do projeto

* Método Search
    <p>Para realizar uma pesquisa sobre um repositório foi inserido no inicio da página uma ferramenta de busca, que consiste em pegar o total de repositórios existentes  e fazer uma varredura usando a função filter que compara os caractere4s que foram digitados com os que tem disponível para exibição.</p>
* Método Paginação e Listagem
    <p>Afim de uma melhor visualização para o usuário, foi soliciato que os repositorios que serestaão sendo exibidos na tela do usuário fossem apresentado em uma quantidade peq   uuena para que assim não ocorra o embaralçhamento de muitas informação em uma tela só, então eu decidir exibir apenas 5 repositorios por paginia, visto que o usuário pode clicar nos butões de next ou previous para ir adiante ou voltar nos repositórios listados. Esse método foi feito da seguinte maneira: é listado quandos items foram aparecidos na pesquisa, e entao é divido pelo o total  de itens máximo que pode aparecer em uma só tela, no caso 5, quando o número de repositórios passa de 5 , os próximos serão jogado para um a outra página, e assim por diante, evitanmdo o embralhamento de informações.</p>
* Exibir um Repositório
    <p>Para exibir um repositório basta que o usuário click no card que o mesmo desejar abrir, logo irá abrir uma nmova página com informações sobre o repositorio desejado (no entanto essa ultima p parte não foi feita pois acabei ficando sem tempo, pois vim receber as infomações que eu precisava ontem dia 09/05/2023, então criei uma página genérica para todos os repositórios).</p>
* Método Filtro
    <p>O método filter  é capaza do usuario filtra se que buscar por repositórios, issues,users, commits e entre outros, para filtar basta que o usuário click no icone superior direto e assim daraessa oportunidade ao usuário de aplicar ofiltro que desejar( Essa ultima parte tbm nao foi feita pois acabei ficando sem tempo devido as infomações serem prestado de ultima hora, mas mesmo assim a funcionalida esta la).</p>
* Método Menu
    <p>No método no menu  que esta localizado no quanto superior esquerdo o usuário pode optar por entrar na paágina de login ou na paágina de pesquisa(principal).</p>
## Sobre
<p>Sou um estudante de Engenharia da Computação pela UFC Campus Quixadá, atualmente cursando o terceiro semestre. Tenho experiência em programação em diversas linguagens, como Python, Javascript,  C, C++ e Assembly, além de programação de microcontroladores com Arduino. Também possuo conhecimento avançado em HTML, CSS e Sass, além de habilidades em gerência de vendas, elaboração de projetos, informática básica e aplicada, pacote Office, programação para aplicativo e web, Ionic, banco de dados Firebase, montagem e manutenção de computadores, habilidades em Linux, habilidades em Git, Sourcetree, VS Code, Angular, Node.js e Canvas. Além disso, possuo experiência com programação de projetos(um deles favorecido pelo o Ministério de Desenvolvimento Regional) no IFCE - campus Boa Viagem e na startup Corredores Digitais</p>

### Contato
* email: elitonp.melo@gmail.com
* celular: (88) 994862894 
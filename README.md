# Informações Básicas
Esse projeto foi gerado utilizando AngularJS, HTML, CSS e um pouco de Bootstrap.

## Iniciar server de desenvolvimento

Para iniciar o server de desenvolvimento, usei a extensão do VSCode chamada "Live Server" [ID: ritwickdey.LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

## Procurar repositório

Para procurar o repositório basta digitar o nome do mesmo na caixa de busca e clicar em Procurar.

Após clicar você será levado para uma página com os repositórios e dois botões: Next e Previous page.

Os botões respectivamente te mostram os próximos 30 ou anteriores 30 repositórios pesquisados.

## Respostas sobre o desafio
### Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou

Utilizei HTML, CSS e JavaScript com a library do Bootstrap para gerar alguns elementos e framework AngularJS.

Ferramentas para o desenvolvimento utilizei o IconHunt para buscar os SVGs e StackOverflow para tirar algumas dúvidas.

### Porque você optou pela tecnologia X e não a Y

Estou em uma transição de carreira de Engenheiro Mecânico para Desenvolvimento de Software. Não tenho muito conhecimentos das funcionalidades e especificações de cada tecnologia disponível e por conta disso resolvi utilizar as tecnologias de acordo com a necessidade e não por opção propriamente dita.

### Quais princípios da engenharia de software que você usou?
Separação de interesse, modularidade, um pouco de incrementação, abstração e um pouco de rigor e formalidade.

### Desafios e problemas que você enfrentou e como você resolveu
Por ser novato no mundo da programação, enfrentei diversos problemas.

O primeiro de todos veio com a definição de que usaria AngularJS para resolução do desafio e já tinha ouvido falar mas nunca tinha visto na prática.
Resolvi lendo a documentação disposta no site e procurei entender qual problema ela tenta solucionar e de qual forma. Admito ter ficado um pouco confuso mas dei continuidade para a prática.

Eu nunca tinha feito nenhum app autoral na vida, muito menos requisição de API e isso foi resolvido procurando vídeos no youtube, stackOverflow e github. Com isso eu consegui montar um app primitivo que fizesse a requisição da API do gitHub e retornasse os dados de maneira satisfatória. A etapa de codar o input, tratamento e disponilização de dados para o usuário foi interrompida por problemas no notebook e então tive que recomeçar.

No recomeço, resolvi ter um curso chamado: How to learn and understand AngularJS na plataforma Udemy para melhorar a escrita e aprender a melhor forma de escrever utilizando MVC.

Então dei continuidade de onde parei, repetindo todo o processo dessa vez utilizando o MVC e finalizando o input e demonstração de dados.

Após o app finalizado foi o momento de tratamento da tela, escolha de cores e etc. A resolução foi simples utilizando as cores próximas ao github e alguns elementos bootstrap.

### O que você entende que pode ser melhorado e como fazer isso
Ao meu ver muita coisa pode ser melhorada, vou tentar listar algumas:

1. Segurança e praticidade: Utilização da build mais recente do AngularJS ou até mesmo utilizar Angular, e também utilizar o Bootstrap mais recente.
2. Código limpo e organização: Utilização de melhores práticas para escrever, identar corretamente as linhas, utilizar uma página de CSS somente para os Styles (não consegui fazer juntamente com o bootstrap, por isso os Styles estão dentro de cada elemento)
3. Testagem: Resolvido facilmente com testes unitários e integrados. Tentei escrever alguns testes unitários mas em AngularJS não consegui. Em Angular, quando estava escrevendo inicialmente o app eu até escrevi alguns testes além dos já iniciais (fiz a instalação, e não por CDN como esse app).
4. Responsividade:  Utilizar melhores práticas de CSS/Bootstrap/SASS. Tentei adaptar o máximo possível para a responsividade mas a falta de prática e conhecimento me limitaram nesse quesito. Um estudo específico e prático de responsividade acredito que seria suficiente.
5. Apresentação ao usuário: Adição de algumas animações, como por exemplo um Loading a partir do momento do click até o GET e disponibilização, ou diminuir esse tempo fazendo uma espécie de PRÉ-GET (da próxima página, ou enquanto digitamos (não sei se é possível)). Adição de um modo escuro/claro. Informações de build, ano, empresa, etc no footer.


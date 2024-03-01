## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

Desenvolvi o projeto utilizando o framework Angular, utilizando TypeScript ao invés de JavaScript e Scss ao invés de css e até Bulma ao invés de Bootstrap, também tentei usar NestJS e conectar ao Firebase, mas nessa parte não consegui continuar (voltei a versão que tinha feito do Firebase por questões de erros, explicar melhor nos "Desafios e problemas" sobre isso). 
Foi minha primeira experiência real com tudo isso, mesmo que já soubesse por cima como que funcionava, uma experiência divertida, diga-se de passagem. Particularmente fiquei mais impressionado com o Cdk/Material que o Angular, pois apenas tinha experiência com o framework Flutter e os alguns dos componentes que tentei usar aqui funcionam diferente por lá (aqui é mais intuitivo btw).


**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

Apesar de terem sim certas diferenças notáveis que eu poderia citar aqui como bônus das tecnologias que eu escolhi, de fato escolhi elas porque queria tentar algo novo e aprender, mesmo que eu conseguisse fazer algo mais completo usando só o básico. E iria utilizar o firebase como banco de dados conectando ao NestJS porque ele foi o último banco que acabei usando para o TG da faculdade, ainda está bem fresco na memória e isso me facilitaria, já que tive dificuldade em juntar o Front com Back (no fim não consegui, estava tentando usar HttpInterceptor)

**Princípios de software**

Quais princípios da engenharia de software que você usou?

Particularmente, como princípios, tentei o DRY e o KISS, se repetir ou fazer algo muito complexo pode ser um tiro no pé enorme, ainda mais quando você está passando para um framework novo e tudo mais. Além disso a estrutura MVC não ficou perfeita dada minhas limitações atuais, porém tinha em mente esse padrão de projeto inicialmente.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

Bem, no inicio, quando fui baixar o angular e criar um projeto, tive um pouco de dificuldade em ver o que que eu teria que escolher ou clicar, mas tudo deu certo, sem problemas. Durante o desenvolvimento em Angular o maior problema que tive foi um certo bug que acontecia por utilizar de maneira errônea o loop do NgFor, estava percorrendo as Tasks da minha Columns e fazendo o let i = index dava erro, porque dentro da minha task eu tenho inputs, toda vez que escrevo algo nele ele atualiza o valor da Task para manter salvo (se eu tivesse colocado banco de dados seria mais visivel isso, porém fica pro próximo problema), claro que isso tem uma solução muito simples e comum, só pegar o length da lista, armazenar numa variável temporária e percorrer ela ao invés da lista em si, assim quando atualizar algo no input o index não vai se "refazer" e tirar o foco do input... Porém tive dificuldade um pouco de dificuldade por ter "mudado a cor da grama", no fim decidi deixar no próprio model das Columns para ficar mais fácil a manipulação.

Agora, o problema real desse projeto inteiro não foi programação, a instalação do NestJS e tentar entender como que eu poderia juntar ele com o Angular, ainda mais já tendo feito Models enquanto fazia o Frontend pro meu projeto no Angular, me confundiu bastante (pois em geral sempre usei linguagens que se conectavam por si só, fazer em Dart do flutter fiz no mesmo framework, no Javascript e python eram dentro deles mesmo e só... Enfim), e a configuração do banco de dados eu achei alguns problemas ao conectar ao NestJS e Angular, talvez seja um erro meu na escolha de um banco que é mais utilizado para mobile, ou o fato de ser um NoSQL. Do projeto inteiro, Angular terminei na metade do segundo dia, o resto do tempo todo foi pesquisando algumas possiblidades, descartando, procurando para ver se outra funcionalidade funcionária (exemplo, Cloud Firestore não funcionou? Será que o Hosting funcionará?) e repetindo isso algumas vezes. 

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

Conectar com o backend é o principal, mas além disso poderia usar um Alert para pedir para colocar nome da Coluna ou da Task antes de efetivamente cria-lá com um placeholder, ou ao invés de limitar apenas a Name and Description em uma task, poderia fazer o usuário colocar quantos dados forém necessários, como um botão "novo campo", para isso também teria que deixar o height da Column variável... A opção de criar usuários sempre é fundamental também, mas uma talvez também fosse interessante adicionar uma possivel rolagem de página para os lados clicando e arrastando com o mouse.

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Meu nome é Gabriel Bonil da Silva, nasci e sempre morei em São José Do Rio Preto, tenho 20 anos, Fiz meu ensino fundamental e médio no SESI, com ensino técnico no SENAI, após conversar com alguns professores de matérias que eu gostava, resolvi começar a fazer cursos e entrar em alguma faculdade de tecnologia, e aqui estou eu. 

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

Independentemente do resultado desse processo seletivo, estarei pesquisando como fazer as coisas que não consegui e provavelmente corrigirei esse projeto no futuro, foi uma ótima experiência mesmo com seus altos e baixos, realmente gostei de como se é feito por aqui, apesar de ter sido um choque para mim não ter conseguido fazer a conexão que queria e acredito que essa será uma ótima experiência em geral.


---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

gabrielbonil32@gmail.com
(17)98192-0437


## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:


**Framework, linguagem e ferramentas**

<p>Para o Desafio-Kanban, usei uma combinação de ferramentas que garantem um projeto robusto e fácil de manter:</p>

<p>* XAMPP foi usado para configurar o servidor Apache e o banco de dados MySQL localmente.</p>
<p>* Node.js é a base para o backend e também gerencia as dependências do projeto via npm.</p>
<p>* Para escrever o código, utilizamos o Visual Studio Code, um editor ágil e com muitos recursos úteis.</p>
<p>* No frontend, usamos Angular para construir uma interface dinâmica e responsiva.</p>
<p>* Para o backend, escolhemos o NestJS, que nos proporciona uma estrutura modular e eficiente para APIs.</p>
<p>* TypeORM facilita a interação com o banco de dados MySQL, tornando as operações mais simples e rápidas.</p>
<p>* A segurança das senhas dos usuários é garantida com bcrypt, enquanto a autenticação é gerenciada através de JWT.</p>
<p>* @angular/material e @angular/cdk ajudaram a criar uma interface mais rica e interativa no frontend.</p>
<p>* mysql2 é usado para a conexão rápida e eficiente com o banco de dados</p>


---
**Técnologias X e Y**

<p><strong>NestJS vs. Express</strong><br>
Utilizei NestJS por ser obrigatório e porque ele oferece uma estrutura mais completa e organizada, ideal para projetos maiores e mais escaláveis. Embora o Express seja mais simples e flexível, o NestJS traz recursos como módulos integrados e uma arquitetura que facilita a manutenção a longo prazo.</p>

<p><strong>Angular vs. React</strong><br>
 o Angular por ser uma das exigências do desafio. Ele vem com muitas ferramentas integradas (como roteamento e formulários), o que acelera o desenvolvimento e reduz a necessidade de bibliotecas externas.</p>

<p><strong>TypeORM vs. Sequelize</strong><br>
O TypeORM porque ele se integra bem com o NestJS 
e é totalmente compatível com TypeScript, o que torna o desenvolvimento mais fluído e organizado.</p>

<p><strong>MySQL vs. PostgreSQL</strong><br>
EscolhI o MySQL pela simplicidade e facilidade de configuração, especialmente com o XAMPP e também proque era uma ferramenta que já tive contato antes.</p>



---
**Princípios de software**

No desenvolvimento do projeto, segui princípios da **engenharia de software** como **modularidade**, dividindo o código em partes independentes para facilitar a expansão. A **abstração** foi importante, especialmente com o **TypeORM**, para simplificar a comunicação com o banco de dados. Também garanti que a aplicação fosse **escalável**, escolhendo tecnologias que permitem o crescimento do sistema sem perder desempenho. Esses fundamentos ajudaram a criar um software bem estruturado e fácil de evoluir.


---
**Desafios e problemas**

*1 problema-* O primeiro problema ocorreu ao criar a pasta do projeto backend-desafio-kanban usando o comando no CMD. Após executar o comando nest new backend-desafio-kanban e escolher a opção npm para o gerenciamento de pacotes, recebi o seguinte erro:<br>
Failed to execute command: git init
Git repository has not been initialized <br>
*1 solução*- A solução foi instalar o Git no meu computador. Para isso, baixei a versão mais recente do Git através do site oficial https://git-scm.com/. Após a instalação, o problema foi resolvido e o comando nest new pôde ser executado corretamente.
<br><br>
*2 problema-* No arquivo backend-desafio-kanban, algumas dependências estavam faltando no package.json, o que impediu o correto funcionamento do projeto. Inicialmente, não consegui identificar quais dependências estavam ausentes, o que dificultou o início do desenvolvimento.<br>
*2 solução-* A solução foi identificar as dependências ausentes e instalá-las manualmente para garantir que o backend funcionasse corretamente. Um exemplo foi a instalação do TypeORM utilizando o comando:<br>
 npm install typeorm --save


---

**Melhorias e próximas implementações**

<p>Atualmente, as swimlanes e os cards no Kanban não estão funcionando como esperado, o que acaba dificultando a navegação e o uso do sistema. Para melhorar isso, seria importante corrigir esses problemas para que os elementos interajam de maneira mais fluida e intuitiva. Também podemos dar uma atenção maior ao design, ajustando os arquivos SCSS para que fiquem mais alinhados e consistentes. Além disso, seria interessante refinar o código, deixando-o mais claro e organizado, e adicionar alguns comentários explicativos para que todo mundo consiga entender e acompanhar o raciocínio por trás das mudanças.</p>



---
**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:
https://jam.dev/c/2af1ed75-8198-4d0f-9b3a-ffa08e224ccf

---
**Sobre você**

Oi, sou a Laura, tenho 19 anos e sou de São José do Rio Preto. Meu primeiro contato com a área de tecnologia foi na ETEC Philadelpho Gouvêa Netto, onde cursei Técnico em Desenvolvimento de Sistemas integrado com o ensino médio durante 3 anos. No final do curso, desenvolvi meu TCC, que foi um site responsivo sobre doações, com o objetivo de incentivar e aumentar as doações por meio da visibilidade dos doadores.

Após concluir o ensino médio, iniciei meus estudos na Unorte, mas logo mudei para a FATEC Rio Preto, onde estou cursando o 1º período, já indo para o 2º. Estou sempre em busca de novos horizontes e conhecimentos, seja por livros ou vídeos no YouTube. Tenho me dedicado bastante para aprender e me aprimorar constantemente, com o objetivo de me tornar uma das melhores na minha área.

---

<h4>E-mail: laurafestacarvalho29@gmail.com <br> Telefone: 17-991291026</h4>





# Projeto Liga das Lendas
<div>
   <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white">
   <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
   <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
   <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
   <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white">
   <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
   <img src="https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white">
</div>


### Tópicos

- [Descrição do projeto](#descrição)
- [API Utilizada](#api)
- [Iniciar o projeto](#iniciar)
- [Funcionalidades](#funcionalidades)
   - [Visualizar campeões](#visualizar)
   - [Buscar campeões](#busca)
   - [Visualizar detalhes do campeão](#detalhes)
   - [Visualizar skins](#skins)
- [Tecnologias](#tecnologias)
   - [Front-end](#front)
   - [Back-end](#back)
   - [Banco de dados](#banco)
 - [Princípios da Engenharia de Software](#principios)
 - [Desafios encontrados](#desafios)
 - [Melhorias a serem feitas](#melhorias)
 - [Sobre](#sobre)
 - [Contato](#contato)

 
<h1 id="descrição">Descrição do projeto</h1>
Este projeto consiste em mostrar todos os campeões do jogo League of Legends, assim como suas habilidades, sua história e todas as suas skins.

<h1 id="api">API utilizada</h1>
Neste projeto eu utilizei a API da <a href="https://developer.riotgames.com">Riot Games</a> para ter acesso aos campeões e seus detalhes.

#<h1 id="iniciar">Iniciar o projeto</h1>
 - Faça o download do projeto
 - Abra um terminal na pasta backend e outro na pasta My-LOL-app
 - Instale as dependências do projeto utilizando este comando em cada terminal
```
npm install
```
 - Utilize esse comando para inicar o projeto
 ```
 npm start
 ```
 - Abra seu navegador neste endereço
 ```
 http://localhost:4200
 ````
<h1 id="funcionalidades">Funcionalidades</h1>
<h2 id="visualizar">Visualizar campeões</h2>
Nesta pagina podemos visualizar os campeões e suas especialidades com paginação de 10 campeões por página.
<img src="./img/View-Campeoes.png">

<h2 id="busca">Buscar campeões</h2>
Nete campo podemos buscar o campeão pelo nome e mostrar.
<img width="1000px" src="./img/busca.gif">

<h2 id="detalhes">Visualizar detalhes do campeão</h2>
Após clicar no campeão desejado podemos visualizar sua passiva, todas suas habilidades e sua história.
<img width="1000px" src="./img/detalhes.gif">

<h2 id="skins">Visualizar skins</h2>
Após clicar no icone de skins somos direcionados para uma pagina que contem todas as skins de todos os campeões, a paginação faz com que a cada página tenhamos todas as skins de apenas um campeão, e nela tambem podemos buscar algum campeão específico.
<img width="1000px" src="./img/skins.gif">

<h1 id="tecnologias">Tecnologias</h1>
 <h2 id="front">Front end</h2>
 <ul>
 <li>Angular</li>
 <li>TypeScript</li>
 <li>CSS</li>
 </ul>
 <h2 id="back">Back end</h2>
 <ul>
 <li>NodeJS</li>
 <li>Jest</li>
 </ul>
 <h2 id="banco">Banco de dados</h2>
 <ul>
 <li>Postgres</li>
 <li>Railway</li>
 </ul>

<h1 id="principios">Princípios da engenharia de Software</h1>
 <p>[S]ingle Responsibility Principle: Princípio da responsabilidade única. Com a componentização do Angular busquei dar uma responsabilidade para cada componente.</p>

<h1 id="desafios">Desafios encontrados</h1>
<p>Primeiramente eu fiz o projeto apenas com front-end, fazendo as requisições com axios, mas isso me gerou problemas pelo caminho e um código muito grande, então decidi criar um back-end para tratar os dados e armazená-los no banco de dados, assim eu saberia exatamente o que recebo em cada requisição.
Outro desafio foi que a url onde pego as informações dos campeões continha o nome do campeão, então para conseguir armazenar essas informações de cada campeão criei um loop para buscar o nome do campeão e depois fazer a requisição com esse nome.</p>

<h1 id="melhorias">Melhorias a serem feitas</h1>
<p>Eu implementei testes no back end utilizando JEST, mas foi minha primeira vez fazendo testes, estou aprofundando meus estudos em testes para conseguir ter uma cobertura de 100% em testes.
Também estou aprofundando meus conhecimentos em Angular pois sei que esse framework tem muitas possibilidades que ainda são desconhecidas pra mim.</p>
<p>Minha idéia é expandir esse projeto para englobar outros coisas do jogo como itens, feitiços,runas e também implementar uma versão mobile para facilitar a pequisa.</p>

<h1 id="sobre">Sobre mim</h1>
<p>Meu nome é Pedro Henrique, tenho 25 anos, estou atualmente cursando o segundo semestre em Análise e desenvolvimento de sistemas na FATEC de São José do Rio Preto,ao entrar na faculdade eu entrei de cabeça direto no mundo de desenvolvimento web, pois queria fazer algo e conseguir ver com facilidade o que estava fazendo e poder mostrar para outras pessoas.</p>
<p>Por conversas na faculdade com professores e alunos eu conheci os videos do professor Guanabara e com eles comecei a desenvolver, depois de alguns meses consegui entrar no programa ONE que é uma parceria da Alura com a Oracle e consegui acesso na plataforma Alura, fiz diversos cursos na Alura, também fiz alguns cursos da Udemy e DIO e até fiz alguns projetos pessoais.</p>
<p>E então veio o Field Academy, ele foi e esta sendo um divisor na minha carreira, sentar com as pessoas, discutir sobre os códigos, poder falar sobre programação e tirar dúvidas tem sido muito bom para o meu desenvolvimento, eu acredito que consegui evoluir muito e espero continuar evoluindo.</p>

<h1 id="contato">Contato</h1>
   <div>
     <a href = "https://web.whatsapp.com/send?phone=5567999001114"><img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" target="_blank"></a>
      <a href="https://www.linkedin.com/in/pedro-henrique-678618218/" target="_blank"><img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" target="_blank"></a> 
     <a href = "mailto:pedrohva.pba@gmail.com"><img src="https://img.shields.io/badge/-Gmail-%23333?style=for-the-badge&logo=gmail&logoColor=white" target="_blank">        </a>
   </div>

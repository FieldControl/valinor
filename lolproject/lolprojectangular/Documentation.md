Aplicativo Angular
Este é um aplicativo web Angular que consiste em páginas e módulos para fornecer funcionalidades específicas. Ele usa o Angular como estrutura principal e para criação de componentes de interface do usuário.

Componentes

AppComponent
 é o ponto de partida do aplicativo, desempenhando o papel fundamental de inicializar e mostrar o conteúdo central do aplicativo.

Auth-loginComponent
O Auth-loginComponent é encarregado da página de login do app, facilitando aos usuários a inserção de suas credenciais para autenticação.


HomeComponent
O HomeComponent é encarregado de mostrar o menu principal do app, oferecendo uma maneira de explorar diversas partes ou recursos do aplicativo.

UserComponent
o user.component tem a função de mostrar a tela de criação de um novo usuário.

ChampionsComponent
o championscomponent é a tela que contem uma tabela de pesquisa de campeões do League of Legends, com base na integração da api ela busca os personagens e lista-os.

ChampionsFreeComponent
o championsFreecomponent a função principal é mostrar os campeões recomendado para iniciantes ou seja os "grátis", através de um slide (carousel).

NavigationComponent
O NavigationComponent tem a função de gerenciar a transição entre as páginas do sistema, cuidando do roteamento e da interação com os componentes de navegação.

NavBarComponent
O NavBarComponent abriga os botões usados para navegar tanto para a tela de login quanto para a página inicial, facilitando a transição entre essas duas áreas.

O FooterComponent desempenha o papel de exibir a parte inferior do sistema, geralmente contendo informações ou elementos relacionados ao rodapé.

Base-component
o base componente definição de variaveis que sao ultilizadas em mais de um componente declaradas em apenas um lugar.

Button-acess-loginComponent
é o botao q da acesso a aplicação web 

Button-navbarComponent
o button-navbarComponent é o componente que esta contido os botao para navegação das redes sociais e os demais para navegação

Button-saveComponent 
o button-savecomponente é o componente que esta guardado a função de salvar o cadastro do novo usuário.

Input-textComponent 
input-textcomponent é o componente generico para inserir as credenciais do login inicial.

Input-Text-New-RegisterComponent
O Input-Text-New-RegisterComponent é um input generico para inserir os dados de criação de um novo usuário.

Label-TextComponent
o label-textcomponente é um componente que contem os label da pagina de login inicial como: "logo", "desenvolvidor por Angelo alves de marchi".

Módulos

AppModule
O AppModule atua como o módulo principal do aplicativo. Ele reúne os módulos essenciais para o funcionamento, incluindo módulos do Angular, internos e do Ionic. Além disso, configura os provedores de serviços necessários para o app.

AppRoutingModule
O AppRoutingModule tem a função de estabelecer as rotas e a funcionalidade de navegação no aplicativo Angular. Ele importa o módulo RouterModule do Angular e define as rotas específicas para o app.

AuthModule
O LoginModule é responsável por conter o component de autenticação do sistema.

NavigationModule
O NavigationModule reúne todos os componentes de navegação do sistema.

SharedModule
O SharedModule agrupa os componentes genéricos do sistema e serviços.

Serviços

Auth-Guard.service.ts
O authGuard desempenha a função de verificar se um usuário está autenticado antes de permitir o acesso a rotas específicas. Ele funciona como um "guarda de rotas" ao implementar a interface CanActivate do Angular. Isso assegura que apenas usuários autenticados possam acessar determinadas partes do aplicativo.

Base-service-request.ts
serviço responsável pelas declaraçoes das propriedade de acesso das api, podendo ser ultilizado em mais de um serviços evitando multiplas declarações.

CenterRequestService 
O CenterRequest é um serviço que lida com solicitações HTTP para buscar informações de uma API. Ele faz uso do módulo HttpClient do Angular para efetuar essas requisições.

TokenGeneratorService
token-generator-service responsavel por gerar token de acesso.

AuthService
authservice responsavel pela criação de um usuário, autenticação e cadastro de usuário.

ChampionsService
o champions.service ele é responsavel por buscar os campeões e listar os campeões da api.

Dependêndencias:

Angular: Uma estrutura de desenvolvimento de aplicativos da web baseada em TypeScript.

HttpClientModule é um módulo do Angular destinado a facilitar a realização de requisições HTTP.

Funcionalidades:
O app disponibiliza as seguintes características:

Autenticação
Quando o usuário insere seu nome de usuário e senha na página de login, o sistema verifica as credenciais. Se forem corretas, um token de autenticação fictício é gerado e armazenado localmente. Esse token é então utilizado para autorizar o acesso às telas principais, como a página menu, campeões... Se a autenticação não for bem-sucedida, um serviço de guarda de rotas impede o acesso a essas telas, permitindo apenas o acesso à página de login.

Integração da api do League of Legends
A integração da API do League of Legends com Angular proporciona uma abordagem dinâmica na criação de tabelas e carrosséis. Ao conectar-se à API do League of Legends, é possível obter dados relevantes sobre campeões e seus detalhes. Essas informações podem ser utilizadas para construir tabelas que exibam características como nome, imagem dos campeões. Além disso, a integração permite criar carrosséis com personagens recomendados para iniciantes. Com essa sinergia entre a API e o Angular, posso proporcionar aos usuários uma experiência imersiva e informativa, explorando o universo do League of Legends de maneira envolvente e interativa.

api de authenticação
Foi feito a simulação de autenticação pelo jsonServer: ('AuthJsonServer.json')

Configuração e inicialização
Para executar a aplicação, siga as etapas abaixo:

Login de usuário:
Usuario: 'field'
senha: 'control'.

Certifique-se de ter o Node.js v.18.17.1 e o Angular CLI v.13.0.0 instalados em sua máquina.
Clone o repositório do aplicativo em sua máquina local.
Abra um terminal na pasta raiz do aplicativo "/c/dev/valinor/lolproject/lolprojectangular".
Execute o comando npm install -f.
Execute o comando npm start para rodar o projeto.
Execute o comando npm t caso deseja testar o projeto.

Aplicativo Angular/Ionic
Este é um aplicativo Angular/Ionic que consiste em páginas e módulos para fornecer funcionalidades específicas. Ele usa o Angular como estrutura principal e o Ionic para a criação de componentes de interface do usuário.



Componentes
AppComponent
O AppComponent é o componente raiz do aplicativo e é responsável por iniciar o aplicativo e renderizar o conteúdo principal.



LoginPageComponent
O LoginPageComponent é responsável por lidar com a página de login do aplicativo. Ele fornece uma interface para os usuários inserirem suas credenciais e autenticarem-se no aplicativo.

MenuPageComponent
O MenuPageComponent é responsável por exibir o menu principal do aplicativo. Ele fornece uma interface para navegar entre as diferentes seções ou funcionalidades do aplicativo.

HomePageComponent
O HomePageComponent é a página inicial do aplicativo. Ele fornece uma visão geral do conteúdo principal ou informações importantes do aplicativo.



NavigationComponent
O NavigationComponent é responsável por controlar toda a navegação entre os componentes de página do sistema, além de controlar o roteamento
e comportar os componentes de navegação.

NavBarComponent
O NavBarComponent é responsável por comportar os botões que são utilizados para navegar tanto para a tela de login, tanto para a página home.

FooterComponent
O FooterComponent é responsável por representar o rodapé do sistema.



ButtonLinkMenuComponent
O ButtonLinkMenuComponent é um componente genérico que foi utilizado na página home, para navegar para a página menu, dependendo de qual API selecionar.

ButtonNavigateComponent
O ButtonNavigateComponent é um componente genérico que foi utilizado no componente NavBar para navegar para os componentes Home e Login.



CardSimpleComponent
O CardSimpleComponent é um componente genérico de Card, foi utilizado no componente Home para desenhar o estilo da tela que o usuário vai utilizar para acessar as APIS.



Módulos
AppModule
O AppModule é o módulo raiz do aplicativo. Ele importa todos os módulos necessários para o funcionamento do aplicativo, incluindo os módulos do Angular, módulos internos do aplicativo e módulos do Ionic. Também define os provedores de serviços necessários para o aplicativo.

AppRoutingModule
O AppRoutingModule é responsável por configurar as rotas e a navegação no aplicativo Angular/Ionic. Ele importa o módulo RouterModule do Angular e define as rotas do aplicativo.



LoginPageModule
O LoginModule é responsável por conter o component de autenticação do sistema.

MenuPageModule
O MenuPageModule é responsável por conter o component de menu do sistema.

HomePageModule
O HomePageModule é responsável por conter o component de home do sistema.



NavigationModule
O NavigationModule é responsável por conter todos os componentes de navegação do sistema.



SharedModule
O SharedModule é responsável por conter todos os componentes genéricos do sistema, e serviços.



Serviços

DialogService
O DialogService é responsável por exibir caixas de diálogo para interação com o usuário. Ele utiliza o serviço AlertController do Ionic para criar e exibir as caixas de diálogo.

GuardService
O GuardService é um serviço de guarda de rotas responsável por verificar se um usuário está autenticado antes de permitir o acesso a determinadas rotas. Ele implementa a interface CanActivate do Angular, o que permite que seja utilizado como um guarda de rotas.

RequisitionService
O RequisitionService é um serviço responsável por fazer requisições HTTP para buscar dados de uma API. Ele utiliza o módulo HttpClient do Angular para realizar as requisições.

MarvelService
O MarvelService é um serviço responsável por interagir com a API da Marvel para obter informações sobre personagens. Ele utiliza o serviço RequisitionService para fazer requisições HTTP à API.

StarWarsService
O StarWarsService é um serviço responsável por interagir com a API de Star Wars para obter informações sobre personagens. Ele utiliza o serviço RequisitionService para fazer requisições HTTP à API.



Dependências
O aplicativo possui as seguintes dependências principais:

Angular: Uma estrutura de desenvolvimento de aplicativos da web baseada em TypeScript.

Ionic: Uma estrutura de interface do usuário para a criação de aplicativos móveis e da web usando tecnologias web padrão, como HTML, CSS e JavaScript.
HttpClientModule: Um módulo do Angular para fazer solicitações HTTP.



Funcionalidades
O aplicativo oferece as seguintes funcionalidades:

Autenticação
Após o usuário inserir seu nome de usuário e senha na página de login, o sistema verifica as credenciais e, se forem válidas, gera um token fictício de autenticação. Esse token é armazenado localmente e usado para permitir o acesso às telas de home e menu principal. Caso o usuário não se autentique, o serviço de guarda de rotas impede o acesso às rotas de home e menu, permitindo apenas o acesso à tela de login.

Integração com a API da Marvel e Star Wars
O sistema é responsável por se comunicar com as APIs da Marvel e Star Wars para obter os dados relevantes. Ele faz solicitações HTTP para recuperar os dados dessas APIs. Os dados da Marvel são exibidos em uma tabela paginada, assim como os dados da Star Wars, que já vêm paginados diretamente da API. A paginação permite que os usuários naveguem pelos dados de forma mais fácil e eficiente.



Configuração e inicialização
Para executar o aplicativo, siga as etapas abaixo:

Certifique-se de ter o Node.js e o Angular CLI instalados em sua máquina.
Clone o repositório do aplicativo em sua máquina local.
Abra um terminal na pasta raiz do aplicativo.
Execute o comando npm install

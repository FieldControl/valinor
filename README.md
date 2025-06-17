🛠️ Instruções de Instalação e Execução do Projeto
✅ Pré-requisitos
Node.js na versão mais recente (recomendado: LTS)

Obs: projeto desenvolvido com Node v22.16.0

Angular CLI instalado globalmente

Editor de código (recomendo o Visual Studio Code)

📁 Estrutura do Projeto
desafio-field/ → Frontend (Angular)

graphql-field/ → Backend (GraphQL + Express)

🔧 Instalação do Projeto
Clone o repositório e abra a pasta raiz do projeto (aprendendo/) em sua IDE.

Instale as dependências necessárias, navegando até as pastas corretas. Se ocorrer algum erro de caminho, use cd desafio-field antes de instalar:

# A partir da pasta 'aprendendo'

# Instalar dependências do frontend
cd desafio-field
npm install
npm install -g @angular/cli
npm install apollo-angular @apollo/client graphql

# Instalar dependências do backend
cd ../graphql-field
npm install apollo-server-express express graphql cors
▶️ Execução da Aplicação
Abra dois terminais:

Terminal 1 – Frontend (Angular)
cd desafio-field
npm run start
# Acesse: http://localhost:4200
Terminal 2 – Backend (GraphQL com Express)
cd graphql-field
node index.js
# Acesse: http://localhost:4000/graphql

🧩 Organização dos Arquivos

📂 desafio-field/src/app/desafio-field/index
index.ts
Contém a lógica principal de interação: adição de tarefas, integração com GraphQL e o uso do CdkDropList para permitir o arrastar e soltar de cards.

index.html
Estrutura visual principal do projeto. Inclui colunas, cards, botões e tudo o que o usuário interage diretamente.

index.css
Responsável pela estilização da aplicação. Define a aparência visual e responsividade da interface.

📂 graphql-field/
index.js
Contém toda a configuração da API GraphQL usando Apollo Server + Express. Foi projetada para ser um backend funcional com armazenamento em memória, simulando um banco de dados.

⚠️ Ainda não consegui integrar completamente este backend com o frontend, mas a API está funcional e pode ser testada diretamente via Playground do GraphQL.



Gostaria de compartilhar como foi meu processo de desenvolvimento, as decisões técnicas que tomei e os aprendizados obtidos ao longo do desafio.

🚀 Linguagens, Frameworks e Ferramentas
TypeScript
Escolhi TypeScript tanto para o frontend quanto para o backend. Além de ser uma linguagem moderna baseada em JavaScript, sua tipagem estática opcional traz mais segurança, produtividade e facilita refatorações e manutenção do código.

Frontend: Angular
Optei pelo Angular por ser um framework robusto para aplicações SPA (Single Page Application). Sua estrutura baseada em componentes, forte integração com TypeScript e suporte a testes tornam o desenvolvimento mais organizado e escalável.

Apollo Angular
Biblioteca oficial que conecta aplicações Angular com APIs GraphQL. Foi utilizada para realizar queries e mutations, garantindo uma comunicação eficaz entre frontend e backend com tipagem forte.

Angular CDK (Component Dev Kit)
Utilizei o CDK para implementar o sistema de drag and drop das tarefas entre colunas. Ele permite criar interações ricas sem depender de bibliotecas externase utiliza CSS puro, o que facilita a personalização.

CSS Puro
Escolhi CSS puro ao invés de SCSS ou bibliotecas como Angular Material para manter total controle visual e garantir leveza à interface.

Backend: NestJS
Framework moderno baseado em TypeScript, com arquitetura modular, inspirado nos conceitos do Angular (como decorators, injeção de dependência e providers). Sua estrutura facilita a escalabilidade e manutenibilidade do projeto.

GraphQL com Apollo Server
Utilizei o pacote @nestjs/graphql com Apollo para estruturar toda a API via GraphQL, permitindo uma comunicação eficiente entre as camadas com queries e mutations bem definidas.


🧠 Motivações Técnicas
Angular: escolhido por sua robustez, arquitetura clara, integração com TypeScript e excelente suporte para projetos em equipe.

NestJS: complemento ideal ao Angular, com suporte nativo ao GraphQL e arquitetura modular.

GraphQL: proporciona maior controle sobre os dados transmitidos, evitando overfetching e facilitando a integração.

Banco em memória: optei por usar dados em memória para manter o projeto leve e fácil de rodar localmente, ideal para fins didáticos e protótipos.

🧱 Princípios de Desenvolvimento

Single Responsibility Principle (SRP): cada classe e função tem apenas uma função bem definida.

Clean Code: nomes claros e descritivos, comentários explicativos, código dividido em camadas e bem organizado.

Componentização: a aplicação frontend está dividida em componentes reutilizáveis e independentes.

Boas práticas com GraphQL: uso de DTOs, validação de inputs, schema estruturado e consistente.

🧩 Desafios e Soluções
1. Utilizar o Angular pela primeira vez: 
➡️Nunca havia utilizado esse framework antes, havia apenas feito uma SPA utilizando html e css apenas, sem nenhum uso de frameworks. Comecei pelo que eu tinha facilidade, então já no primeiro dia havia terminado a parte de html e css que já estava familiarizado. No segundo dia percebi que não seria tão fácil aplicar o angular, já que na verdade o Angular tem que vir praticamente antes de fazer qualquer coisa. Tive muitas dificuldade, em instalar as bibliotecas necessárias, em aplicar meu código já feito no Angular. Para solucionar esses problemas passei o segundo dia inteiro estudando sobre o Angular, no fim do dia consegui aplicar o angular na minha IDE e abrir meu primeiro projeto em Angular. Consegui também criar novos componentes e colocar meu código já pronto dentro dele. e Após o segundo dia minha aplicação já estava rodando em Angular.

➡️A próxima dificuldade foi em utilizar a biblioteca CDK. Eu havia feito as funções de arrastar em JavaScript, mas resolvi me desafiar e navegando pela documentação do Angular achei a parte de drag and drop, tive muita dificuldade em aplicar no meu código, sempre dava erro, os elementos não arrastavam, ou então não puxava o array de items do meu typescript, mas fui com muita paciência pesquisando e consegui fazer com que fosse permitido que as tarefas fossem arrastadas entre as colunas. 


2. Integração entre Angular e Apollo GraphQL
➡️Infelizmente não consegui fazer a integração entre meu front-end e meu back-end, fazia de todas as formas possíveis, mas sempre dava erro crítico e meu site inteiro ficava branco, ambas as partes ficaram prontas, mas infelizmente os dados do front-end não estão sendo enviados para o back-end, e não consegui resolver esse erro crítico.

🔧 Melhorias Futuras
Melhorias rápidas:
Adicionar campo de data de criação aos cards completos e não só tarefas.

Aplicar um banco de dados sólido para que os dados não sejam excluídas ao recarregar a página e guardar os dados de tarefas criadas.

Próximos passos:

Detectar mudança de coluna ao soltar um card.

Aplicar o CRUD inteiramente em Graphql

🎥 Apresentação em Vídeo
👉 https://youtu.be/aPSqkiChv0g

👨‍💻 Sobre mim
Sou de São José do Rio Preto e tive contato com programação pela primeira vez durante o ensino médio no SENAC, desenvolvi ao final do ano de 2024 um projeto, onde tive que desenvolver um site em HTML e CSS e ligar uma página de login a um banco de dados, usando MySQL e MongoDB.


Sou movido por desafios e aprendizado constante. Esse foi meu primeiro contato com Angular, NestJS e GraphQL, e mesmo com pouco tempo, consegui desenvolver algo funcional e estou orgulhoso da evolução que tive.


Telefone: 17 991418841
e-Mail: maiolilucassandoval@gmail.com
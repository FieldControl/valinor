Framework, linguagem e ferramentas

O projeto foi desenvolvido utilizando Angular no front-end e Node.js no back-end. O Angular foi escolhido por ser um framework robusto, que facilita a criação de aplicações SPA (Single Page Application) e fornece um ecossistema organizado para desenvolvimento escalável. No back-end, utilizamos Node.js que permite uma API leve, eficiente e com boa integração ao front-end.

Ferramentas utilizadas:

Angular – Framework para construção do front-end.

TypeScript – Linguagem utilizada no Angular, que adiciona tipagem estática ao JavaScript.

Node.js – Ambiente de execução do JavaScript no back-end.

CSS e Bootstrap – Para estilização e responsividade da aplicação.

Minha visão sobre o desenvolvimento
De início, comecei com a parte do front-end, que é o meu forte. Após isso, migrei para a parte do back-end para fazer todo o processo funcionar conforme as expectativas do teste. Apesar de não ter muita familiarização com o sistema back-end, para mim foi uma experiência valiosa, pois consegui aprender muito sobre essa área usando novas tecnologias.

Utilizei muito o YouTube para pesquisa e também o Reddit para resolver alguns erros que ocorreram ao longo do desenvolvimento. Isso me ajudou a garantir que o sistema fosse enviado o mais correto possível, minimizando erros e garantindo um bom funcionamento.

Desde já, agradeço grandemente pela oportunidade da entrevista que já fiz com a gestora Vitória. Esse teste me proporcionou uma grande evolução em apenas 4 dias de prazo.

Tecnologias X e Y
Optei por usar Angular em vez de React devido à sua estrutura mais opinativa e à facilidade em projetos empresariais, onde a padronização é essencial. Além disso, o Angular fornece soluções integradas, como roteamento e manipulação de formulários, o que reduz a necessidade de bibliotecas externas.

No back-end, Node.js foi escolhido em vez de Django/Python porque o JavaScript no back e front cria um ambiente unificado de desenvolvimento, reduzindo complexidade e aumentando a eficiência.

Princípios de software

Modularidade: O código foi dividido em componentes reutilizáveis no Angular.

Desafios e problemas

Erro "document is not defined": Ao tentar manipular o DOM diretamente no Angular, o código não funcionava no ambiente de servidor. Resolvemos utilizando a abordagem correta do Angular com Renderer2.

Erro 404 ao carregar imagens e CSS: O caminho dos arquivos estava incorreto, e resolvemos ajustando as referências dentro do angular.json e no código dos componentes.
*
Drag and Drop no Kanban: Implementar o arrastar e soltar dos cards exigiu o uso da biblioteca @angular/cdk/drag-drop, que foi integrada com sucesso.
*
Melhorias e próximas implementações
*
Autenticação de usuários: Implementar login e controle de permissões.
*
Persistência no Drag and Drop: Salvar automaticamente a posição dos cards no banco de dados.
*
Melhoria no design: Refinar a interface com melhores animações e responsividade.
*
Testes automatizados: Criar testes unitários para garantir a qualidade do código.

Vídeo de apresentação
Gravaremos um vídeo demonstrando as principais funcionalidades do projeto. O link será disponibilizado assim que finalizado.

Sobre mim
Meu nome é Samuel, sou desenvolvedor de software com experiência em aplicações web e apaixonado por tecnologia. Tenho interesse na vaga de desenvolvimento full-stack, tenho facilidade em aprender e busco sempre estar adquirindo mais conhecimentos.

Tecnologias Utilizadas
Angular: Framework JavaScript para construção de interfaces web.
TypeScript: Linguagem de programação para desenvolvimento Angular.
HTML/CSS: Para estruturação e estilização da interface.

Pré-requisitos
Node.js e npm
Angular CLI

Como fazer a Execução do projeto na sua maquina local (localhost)
Execute o servidor de desenvolvimento: ng serve
Abra o navegador em http://localhost:4200/

Configuração
Configurações do Angular: O arquivo angular.json contém as configurações do projeto Angular.
Dependências: O arquivo package.json lista as dependências do projeto.
Rotas: As rotas do aplicativo estão configuradas em app-routing.module.ts.


Componentes Principais
Home: Componente para a página inicial do aplicativo.
Kanban: Componente para gerenciamento de tarefas no estilo Kanban.


Outros Arquivos
app.module.ts: Módulo principal do aplicativo.
app.component.ts: Componente raiz do aplicativo.
styles.css: Estilos globais do aplicativo.
index.html: Página HTML principal.
assets/: Pasta para recursos estáticos.
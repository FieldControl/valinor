### **AngularSearch**

Este projeto foi desenvolvido com [Angular CLI](https://github.com/angular/angular-cli) _version_ 16.2.6 com intuito de demonstrar habilidade de programação e desenvolvimento de softwares utilizando o framework.

O projeto consiste em uma página SPA de pesquisa do GitHub, utilizando as _APIs_ do próprio GitHub, foi desenvolvido para que o usuário consiga alternar as pesquisas entre Repositórios ou _Issues_.

A escolha do framework Angular CLI foi por conta da facilidade que proporciona no desenvolvimento, por exemplo, a importação do Angular Material para utilizar componentes prontos como uma toolbar, uma _sidenav_ e demais ferramentas.

Este projeto foi um desafio empolgante, pois marcou minha primeira incursão no desenvolvimento com Angular. Para concluir este desafio e entender como funciona o framework, realizei estudos ágeis, incluindo cursos do YouTube e a exploração de explicações de ferramentas de IA. Optei pelo Angular Material devido à disponibilidade de tutoriais, mas também estou interessado em explorar outras bibliotecas, como o _PrimeNG_, que oferece recursos abrangentes e que desejo aprender no futuro.

Infelizmente por conta do tempo e do meu conhecimento atual, não tive a oportunidade de pesquisar e implementar testes na aplicação, porém sei da importância e que agrega no desenvolvimento, facilitando algumas etapas e auxiliando na verificação de bugs.

Acredito que o software possa ser melhorado sim com algumas soluções corretas para pequenos desafios que foram encontrados ao longo do desenvolvimento, como por exemplo o container da _sidenav_ precisa ter algum conteúdo para o botão de abrir e fechar funcionar, tive que criar uma solução para quando não existia resultados de pesquisa no container, pois a _sidenav_ é um menu onde o usuário escolhe qual o tipo de pesquisa que ele quer realizar, e como não tenho experiência com esta programação tive que apelar a pesquisas na internet para encontrar uma solução para este problema, e assim foi criado o serviço _CheckResults_ no qual esta função verifica se existe resultados de pesquisas, caso não tenha, uma variável é usada para preencher o container da _sidenav_ com uma imagem e uma frase em uma div que ocupa todo o espaço do container. Outro ponto importante a ser ressaltado é o código responsivo, infelizmente a aplicação não está responsiva e poderia se tornar uma melhoria futura, como disse acima, a falta de conhecimento atual e a primeiro contato com este tipo de programação desencadeou estes problemas.

### **Componentes e Serviços**

A estrutura do código é organizada por componentes e serviços gerados no framework, o projeto conta com 4 componentes e 5 serviços, sendo eles:

### **Componentes:**

- NavBar
- SideNav
- Página de Resultados
- Footer

### **Serviços:**

- **CheckResults:** Serviço que atua quando a página é iniciada, checando se existe algum resultado de pesquisa, caso não haja, uma variável é acionada como <span style="color: red;">true</span>, e é utilizada para apresentar uma div com uma imagem no container para o funcionamento correto da sidenav.

- **Drawer:** É um serviço para conseguir utilizar a função de abrir ou fechar a sidenav por meio de um botão em outro componente, no caso um botão na NavBar.

- **Issues:** É um serviço para compartilhar a API e os resultados (dados) geridos pela ferramenta.

- **Repo:** Serviço identico ao Issues, com a diferença de compartilhar a API referente a pesquisa de Repositórios.

- **Show-search-results:** Serviço criado para compartilhar 4 variaveis com todos os componentes do código a fim de utilizá-las conforme o necessário.
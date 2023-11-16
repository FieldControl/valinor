<h1 align="center"> FieldControl Challenge </h1>

<p align="center">
  <img src="./src/assets/company/field3.jpeg">
</p>

<h2 align="center"> Desafio técnico </h2>


<p align="center">
<a href="https://www.linkedin.com/in/guilherme-cagide-fialho/">
  <img src="https://img.shields.io/badge/-@guilherme-2CA5E0?logo=Linkedin&logoColor=white" width="150"/> </a>
<a href="https://github.com/GuilhermeCF10">
  <img src="https://img.shields.io/badge/-GuilhermeCF10-gray?logo=Github&logoColor=white" width="170"/> </a>

---

## Sumário
  - [Proposta](https://github.com/GuilhermeCF10/FieldControlChallenge#proposta-)
  - [Como rodar o projeto?](https://github.com/GuilhermeCF10/FieldControlChallenge#como-rodar-o-projeto-%EF%B8%8F)
  - [O que está funcionando?](https://github.com/GuilhermeCF10/FieldControlChallenge#o-que-está-funcionando-)
  - [Tecnologias usadas](https://github.com/GuilhermeCF10/FieldControlChallenge#tecnologias-usadas)
  - [Agradecimentos](https://github.com/GuilhermeCF10/FieldControlChallenge#agradecimentos)

#
## Proposta 🚧

#### Desenvolva um SPA que permitirá que um usuário pesquise repositórios no GitHub (os resultados devem ser paginados) e exiba informações relevantes de cada repositório (URL, descrição, contagem de watchers, de estrelas, issues e etc..)

Basicamente, uma tela quase parecida com essa: https://github.com/search?utf8=%E2%9C%93&q=node&type=

Você pode usar o seu framework SPA de preferencia, porém, estamos dando prioridade para testes feitos em Angular e AngularJS!

Escreva seu código com clareza e use a estrutura adequada do MVC para escrever o aplicativo e use as melhores práticas ao escrever JavaScript, CSS e HTML.

Um diferencial gigante é o uso de testes unitários e integrados!

#### Requisitos mínimos
- Usar um framework (de preferencia angular)
- Lista items de uma API
- Ter páginação via API

#
## Como rodar o projeto? 📽️ 

- Etapa 1: Clonar o projeto
    ```
        git clone https://github.com/GuilhermeCF10/FieldControlChallenge
    ```

<br />
  
- Etapa 2: Entrar no projeto e instalar dependencias node
    ```
        cd FieldControlChallenge && pnpm install
    ```
<br />

- Etapa 3: Iniciar projeto
    ```
        pnpm dev
    ```
<br />

    





#
## O que está funcionando? 💻

Funcionalidade | Status
:---------|:----------
Visualizar repositórios por nome com paginação      |  ✅  
Visualizar detalhes de um repositório                                      |  ✅  
Visualizar todas as issues de um repositório                                      |  ✅ 


#
## Tecnologias Utilizadas 👨‍💻

**Next.js:** Optei por Next.js devido ao meu domínio em React e à sua capacidade de otimização automática de páginas, server-side rendering, e geração de sites estáticos. Isso proporciona uma melhor experiência de usuário e performance, comparado ao Angular/AngularJS.

**TypeScript:** Minha escolha por TypeScript ao invés de JavaScript puro deve-se à sua robustez em termos de tipagem forte, o que minimiza erros em tempo de execução e melhora a manutenção do código.

**TailwindCSS:** Decidi usar TailwindCSS por sua abordagem de utilidade-primeiro que me permite estilizar de maneira rápida e eficiente, trazendo uma experiência de desenvolvimento mais ágil em comparação com o CSS tradicional.

### Detalhes do Projeto 💬

#### Ferramentas e Bibliotecas Utilizadas 👽
Para este projeto, escolhi uma combinação de Next.js, TypeScript, TailwindCSS, Axios, e a API do GitHub. Next.js foi escolhido pela sua facilidade em criar aplicações React otimizadas para SEO e com suporte a server-side rendering. TypeScript me oferece uma experiência de desenvolvimento mais robusta e segura com sua tipagem forte, o que é crucial para manter a qualidade do código em projetos maiores. TailwindCSS agiliza o processo de estilização com sua abordagem de utilidades CSS, tornando o desenvolvimento de interfaces mais rápido. Por fim, utilizei Axios para fazer requisições HTTP devido à sua simplicidade e facilidade de uso, especialmente quando integrado com a API do GitHub para buscar dados de repositórios e issues.

#### Porque Optei pela Tecnologia X e não a Y 👻
Minha escolha por Next.js, TypeScript e TailwindCSS em vez de Angular ou AngularJS foi guiada tanto pela minha familiaridade com estas tecnologias quanto pelos benefícios técnicos que elas oferecem. Next.js proporciona uma experiência de desenvolvimento mais integrada com React, além de otimizações automáticas e suporte a SSR. Prefiro TypeScript ao JavaScript puro pela segurança adicional que a tipagem forte oferece, reduzindo a possibilidade de erros em tempo de execução. Escolhi TailwindCSS por sua flexibilidade e eficiência no desenvolvimento de interfaces, o que me permite focar mais na lógica do aplicativo do que na estilização

#### Princípios de Engenharia de Software Aplicados 🤖
Durante o desenvolvimento deste projeto, apliquei o princípio DRY (Don't Repeat Yourself), que envolve a redução de duplicação no código. Isso foi alcançado por meio do uso de funções reutilizáveis e componentes em React, garantindo que a mesma lógica ou componente não fosse repetido desnecessariamente. Também adotei os princípios SOLID, que são cinco diretrizes de design orientado a objetos para escrever código mais compreensível, flexível e sustentável. Por exemplo, utilizei a segregação de interface (um dos princípios SOLID) ao projetar componentes React, garantindo que eles tivessem uma única responsabilidade e não fossem sobrecarregados com funcionalidades que não lhes pertencem. O uso de páginas, componentes e hooks em React alinha-se com esses princípios, ajudando a manter o código organizado, modular e fácil de manter

#### Desafios e Soluções e Áreas de Melhoria 💯

Um dos principais desafios que enfrentei foi a limitação de requisições da API do GitHub para usuários não autenticados. Para superar isso, a solução ideal seria implementar a autenticação do usuário e vincular uma chave API (API Key) para aumentar o limite de requisições disponíveis. Embora eu esteja ciente desta limitação, acabei não implementando essa funcionalidade no projeto. Acredito que a adição da autenticação e gestão de chaves API pode melhorar significativamente a funcionalidade do projeto, não apenas aumentando o limite de requisições, mas também personalizando a experiência do usuário com base em sua conta do GitHub


#
## Agradecimentos 🤌
 - [Gabriela Zapater](https://www.linkedin.com/in/gabriela-zapater-89775b164/?originalSubdomain=br) pela indicação.
 - [Field Control](https://www.linkedin.com/company/field-control/) pela oportunidade.

#
<p align="center">
<a href="https://github.com/GuilhermeCF10">
  <img src="./src/assets/me/GCF.png" width="96" style="border-radius: 20px;">
</a>
<h1 align="center"> Guilherme Cagide Fialho </h1>
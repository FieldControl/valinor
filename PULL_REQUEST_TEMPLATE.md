# **Kanban**

Este projeto é uma aplicação de Kanban simples, desenvolvida com **Angular**, **NestJS** e **GraphQL**. Ele permite a criação, movimentação e exclusão de tarefas em colunas como "Em Processo" e "Finalizado".

## **Envio de solução**

Inicialmente, optei por desenvolver um Kanban simples, já que estava utilizando tecnologias com as quais eu ainda não tinha experiência, especialmente o Angular. Foi um grande desafio que me tirou completamente da zona de conforto, mas ao mesmo tempo me proporcionou uma oportunidade valiosa de aprender na prática e explorar as possibilidades que essa stack oferece.

Comecei pelo básico, me familiarizando com a estrutura do Angular e configurando o GraphQL para o consumo da API. Optei por usar o TailwindCSS para a estilização, pois já tenho domínio sobre a ferramenta e isso me permitiu focar mais nas funcionalidades da aplicação sem perder tempo excessivo com a parte visual.

A estruturação do backend foi mais tranquila, graças à experiência prévia com APIs.

No geral, desenvolver esse projeto me trouxe bastante aprendizado. Apesar dos desafios, foi gratificante ver a aplicação funcionando.

---

### **Framework, linguagem e ferramentas**

- **Frontend:** Angular 19
  - **TailwindCSS:** utilizado para estilização e responsividade.
  - **Apollo Angular:** integração com GraphQL para consumir os dados da API.
- **Backend:** NestJS
  - **GraphQL com Apollo Server:** utilizado para a API.
- **Testes:**
  - **Jest:** utilizado para testes unitários e de integração no backend.
  - **Karma e Jasmine:** utilizados no frontend para validar o comportamento dos componentes e serviços.

---

### **Tecnologias X e Y**

  Escolhi TailwindCSS em vez de CSS puro para ganhar produtividade e flexibilidade. Ele permite estilizar direto no HTML com classes utilitárias, agilizando o desenvolvimento e focando nas funcionalidades.

---

### **Princípios de software**

- **SOLID:**
  - Organizei o backend em módulos, separando bem as responsabilidades entre resolvers e serviços.
  - No frontend, isolei as funcionalidades em componentes para manter o código organizado.
- **KISS (Keep It Simple, Stupid):**
  - Mantive o projeto o mais simples e funcional possível, sem complicar desnecessariamente.
- **DRY (Don’t Repeat Yourself):**
  - Reaproveitei código no backend e centralizei a lógica do frontend no serviço de tarefas.
- **Componentização:**
  - Dividi o frontend em componentes, o que facilitou os testes e a manutenção.

---

### **Desafios e problemas**

1. **Entender o Angular:**
   - O maior desafio foi sair da minha zona de conforto com o NextJS e aprender Angular do zero para desenvolver este projeto. Foi um processo intenso, mas consegui superar com a ajuda da documentação oficial, vídeos tutoriais e muitas consultas na internet. Essas fontes foram essenciais para entender a estrutura do framework e concluir o projeto.

---

### **Melhorias e próximas implementações**

- **Persistência de Dados:**
  - Atualmente, os dados são armazenados em memória no backend. Uma melhoria seria adicionar um banco de dados (ex.: MongoDB ou PostgreSQL).
- **Autenticação:**
  - Adicionar suporte para usuários com autenticação JWT.

---

  ### **Vídeo de apresentação**

<https://jam.dev/c/6662b15f-bd26-4b95-83b4-7ec9d428fefa>

---

### **Sobre você**

Com mais de 11 anos de experiência em TI, iniciei minha trajetória profissional em 2013, focando na manutenção de computadores e redes, área em que atuei intensamente. Meu nome é Vitor Eduardo de Paula, tenho 26 anos e sou natural de Floreal/SP. Em 2016, tive meu primeiro contato com programação, graças a um amigo que me apresentou esse universo, despertando meu interesse pela área.

Em 2018, iniciei minha graduação em Ciências da Computação, onde estudei por 2 anos. Apesar de não ter concluído o curso, continuei me aprofundando de forma independente e prática. Desde então, embarquei em projetos de desenvolvimento web como freelancer para startups, especializando-me na criação de páginas web e interfaces modernas.

**Nome:** Vitor Eduardo de Paula
**Contato:** (17) 98151-3855
**Email:** vitordepaula98@hotmail.com
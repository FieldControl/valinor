## 📌 Sobre o Projeto

Este projeto consiste em uma aplicação web com um sistema de Kanban, desenvolvida utilizando Angular no frontend e NestJS no backend, com banco de dados MySQL. O objetivo principal foi criar um ambiente funcional e visualmente organizado para gestão de tarefas.

## 🧠 Decisões Técnicas e Ferramentas Utilizadas

- **Frontend:** Angular
- **Backend:** NestJS
- **Banco de Dados:** MySQL
- **ORM:** TypeORM
- **Ferramentas auxiliares:** Postman, VS Code, Git

### Por que escolhi essas tecnologias?

- **Angular**: É um framework completo e robusto para aplicações SPA (Single Page Application), com excelente suporte a rotas, componentes, serviços e testes. A escolha foi feita também pensando na organização do projeto e escalabilidade.
- **NestJS**: É um framework que segue os princípios do Node.js, mas traz uma estrutura limpa baseada em módulos, muito próxima ao que usamos em backend de aplicações corporativas. Isso me ajudou a manter o projeto organizado e bem estruturado.
- **MySQL**: Por ser um banco relacional amplamente utilizado e fácil de integrar com o TypeORM, foi a escolha ideal para este projeto.

## 🧱 Princípios de Engenharia de Software Utilizados

- **Separação de responsabilidades**: O código foi dividido por camadas no backend (controllers, services, modules) e por componentes e serviços no frontend.
- **Reutilização de código**: Criação de componentes reaproveitáveis e organização em módulos.
- **Boas práticas com Git**: Commits frequentes e descritivos, organização clara do repositório.
- **Escalabilidade e manutenção**: Estrutura pronta para crescer, com pastas bem definidas.

## 🔧 Desafios e Soluções

- **Integração entre frontend e backend**: Enfrentei dificuldades para garantir que as rotas e os dados estivessem corretamente alinhados. Resolvi isso testando com Postman e ajustando os endpoints conforme necessário.
- **Erro de CORS**: Tive que configurar o CORS no backend para permitir a comunicação com o frontend durante o desenvolvimento.
- **Relacionamentos no banco de dados**: Precisei ajustar as entidades no TypeORM para garantir que os relacionamentos entre as tabelas funcionassem corretamente. Usei `JoinColumn` e `OneToMany` / `ManyToOne` conforme necessário.

## 🧪 Como executar o projeto

### Backend
1. Acesse a pasta `backend`
2. Instale as dependências: `npm install`
3. Configure o `.env` com os dados do banco
4. Rode o servidor: `npm run start:dev`

### Frontend
1. Acesse a pasta `frontend`
2. Instale as dependências: `npm install`
3. Rode o app: `ng serve`

> O sistema vai conectar automaticamente à API configurada no backend se estiver no mesmo host. Caso esteja em outro local, basta ajustar a URL base no service responsável pelas chamadas HTTP.

## ✨ O que pode ser melhorado

- Adicionar **testes automatizados** (unitários e integrados) para garantir a qualidade do código.
- Criar autenticação e controle de usuários, para permitir múltiplas sessões e segurança.
- Implementar **deploy em nuvem** (como Vercel/Render para front e back) para testar em produção.
- Criar drag-and-drop nas tarefas do Kanban.

## 🙋‍♀️ Sobre mim

Sou uma desenvolvedora full-stack, apaixonada por tecnologia e por tudo o que ela representa em termos de evolução e possibilidades. Estou em constante aprendizado e cada projeto é uma oportunidade real de crescimento pessoal e profissional. Tenho buscado desenvolver habilidades práticas com Angular, NestJS, banco de dados relacionais e APIs REST, sempre com muita dedicação e curiosidade.

Acredito na força da prática, da construção com propósito e da colaboração. Estou determinada a seguir na área da tecnologia, explorando novos desafios e criando soluções que façam sentido. Este projeto foi mais uma etapa importante nesse caminho, e estou animada para o que ainda está por vir.

Caso queira entrar em contato comigo:
- **Email:** amandacalirimartins@email.com  


---

Agradeço a oportunidade de mostrar como penso e como encaro desafios. Fico à disposição para qualquer dúvida ou sugestão.

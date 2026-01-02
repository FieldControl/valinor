## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

- Backend: NestJS, TypeScript, Prisma, Class-validator e Class-transformer
- Frontend: Angular, Angular Material, Angular CDK, Typescript
- Banco de dados: SQLite inicialmente, porém, foi migrado para PostgreSQL em produção
- Realtime: Socket.io para desenvolvimento e em produção Ably devido à limitação da Vercel quanto ao uso de WebSockets

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

- As tecnologias foram escolhidas devido aos requisitos do desafio.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

- Procurei implementar um código limpo, com nomes de funções e variáveis descritivas, seguindo os princípios de SOLID, seguindo uma estrutura modular, Dry onde eu reaproveitei código em services.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

#### Backend

- Inicialmente tive problemas de configuração da nova versão do prisma utilizando o banco de dados SQLite, porém, consegui resolver o problema seguindo a documentação oficial.
- Tive também problemas em relação a persistência dos dados na reorndenação de cards e columns, porém, consegui resolver o problema implementando uma verificação de posição das colunas e cards para que ao arrastar ambos elas sejam reordenadas corretamente e salvas no banco de dados.

#### Frontend

- Em relação ao Drag and Drop, eu queria entender mais como funcionava em si, e como implementar ele, seguido pela persistência dos dados, onde eu crei uma rota apenas para reordenar as columns e cards pois achei mais facil de implementar.

#### Deploy

- Migrar o banco de dados de SQLite para Postgres para conseguir subir em produção, utilizei a vercel em ambos (front e back) e a neon para hospedar o banco de dados.

- Erro classíco de CORS, que foi resolvido adicionando a função bootstrap no app.module.ts do backend.

- Realtime: Após conseguir subir o backend e frontend, percebi que o socket.io não funcionava em produção devido à limitação da Vercel quanto ao uso de WebSockets, então, decidi utilizar o Ably para o realtime que é uma das opções em que a vercel sugere.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

- Acredito que o meu próximo passo (e que ainda irei fazer) seria tornar a aplicação responsiva para dispositivos móveis
- Testes automatizados: Implementar testes automatizados para garantir a qualidade do código e facilitar futuras manutenções.
- Api em GraphQL ao invés de REST.
- Autenticação e autorização onde usuários podem se registrar, fazer login e criar seus próprios boards.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:

- Video de apresentação: https://youtu.be/bKrxSSZKV6o
- Link do projeto em produção: https://kanban-frontend-amber.vercel.app
- Link do repositório isolado: https://github.com/MateusLeonardo/kanban

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

- Eu nasci e fui criado em São José do Rio Preto,tenho 28 anos e sou casado a 4 meses, desde criança gostava de passar horas no computador jogando com meus amigos, aos 18 começei a treinar musculação e resolvi fazer educação física, onde trabalhei por volta de 7 anos em academia. Após isso, como tinha um certo tempo sobrando e não estava tão satisfeito na área, um amigo meu me disse para fazer um curso de html e css do Gustavo Guanabara no youtube antes de começar Ánalise e Desenvolvimento de Sistemas, e foi ai que me apaixonei pelo desenvolvimento de software, consegui um emprego onde eu trabalho atualmente, quase 1 anos e 7 meses, nesse tempo fiz minha transição de carreira onde agora busco desafios ainda maiores.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

- Foi muito desafiador principalmente o frontend pois não tinha muito conhecimento em angular, apesar de saber typescript, mas fui vendo a documentação e entendendo mais sobre o framework que é bem parecido com nestjs em relação a modularidade.

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :)

- E-mail: mateus_leonardo1997@hotmail.com
- Whatsapp: (17) 98231-4442

# Framework, linguagem e ferramentas

Framework: NestJS

Linguagem: TypeScript

ORM: Prisma

Banco de dados: SQLite (ou outro conforme configurado)

Testes: Jest

Validações: class-validator e class-transformer

# Tecnologias X e Y

Prisma vs TypeORM: Prisma oferece uma experiência de desenvolvimento moderna, com excelente suporte a tipos, migrações simples e geração de código clara. TypeORM é mais verboso, com problemas de manutenção.

Jest vs outros test runners: Jest é rápido, bem documentado e possui ótimos recursos nativos como mocks, o que facilita escrever testes unitários e de integração.

# Princípios de Software

Separation of Concerns: Separar as funções do sistema em camadas. No projeto, o controller ficou responsável por receber as requisições HTTP, o service concentrou a lógica principal, e o Prisma foi usado para lidar com o banco de dados. Isso facilitou muito a organização do código e a manutenção.

Single Responsibility Principle: Descobri que cada parte do sistema deve ter uma única responsabilidade. Procurei aplicar isso mantendo cada classe focada em uma função específica, como os services cuidando apenas da lógica de negócios daquela entidade.

Dependency Injection: Vi que o NestJS usa injeção de dependência por padrão, o que me ajudou bastante na hora de testar o código. Eu pude simular serviços e usar mocks para garantir que os testes não dependessem de recursos externos.

DRY: evitar repetir código. Por isso, centralizei a lógica nos services para não duplicar regras nos controllers.

# Desafios e Problemas

Validação de entidades relacionadas: Um dos desafios foi garantir que operações como update/delete em Card e Column fossem feitas apenas se a entidade existisse. Resolvi isso com validações no service e retornos apropriados (404).

Erros do Prisma: Lidamos com erros do tipo P2025 (entidade não encontrada) e P2003 (violação de chave estrangeira). Isso exigiu tratamento específico no controller e testes para garantir que os erros fossem capturados corretamente.

Testes com Prisma: Foi preciso decidir entre mockar o Prisma ou usar o banco real. Para testes unitários usamos mocks com jest.fn(), e para testes de integração usamos uma instância do banco com dados reais. Isso trouxe mais confiança no comportamento real da API.

Melhorar cobertura de testes: Incluir testes de borda e casos de erro mais detalhados, principalmente em endpoints de atualização e deleção.

# Melhorias e Próximas Implementações

Soft delete: Em vez de deletar entidades permanentemente, poderíamos marcar como “deletado”.

Autenticação e Autorização: Adicionar suporte a usuários e controle de acesso por projeto.

Notificação em tempo real de mudanças no board (ex: card movido).

# Video Iniciando e funcionando no Postman (Backend) no Youtube

Link iniciando no vscode o backend: https://youtu.be/5Cbd86OX9f4
Link postman: https://youtu.be/rbbTXjrjPHM

# EU Patrick Baspper

Nasci em São José do Rio Preto e moro em São José do Rio Preto

Me formo na UNIRP em Análise e Desenvolvimento de Sistemas em Julho 2025, trabalhei Artesanal Pães em Janeiro 2021 - Janeiro 2022 || Estagiario em Marketing CasaShopFacil Janeiro 2024 - Outubro 2024 || Auxiliar Administrativo CasaShopFacil Outubro 2024 - Abril 2025.

Comecei a faculdade de tecnologia por gostar de computador, jogos e afins assim que terminei o ensino médio decidi começar a faculdade em ADS para entender melhor o mundo de Software e agora que me formei estou a procura de entrar no mundo de dev e aprender e melhorar.

Email: patickbasppersilva@gmail.com
Tel: (17) 99168-7373

# Detalhes

O FrontEnd está incompleto

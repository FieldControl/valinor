# Documentação do Projeto GitFind

## Objetivo do Projeto

O projeto GitHub Search é uma aplicação web desenvolvida em Next.js 13 que tem como objetivo permitir aos usuários pesquisar por repositórios e usuários no GitHub. A aplicação consome a API pública do GitHub para recuperar informações relevantes e apresentá-las de forma acessível e organizada aos usuários.

### Funcionalidades Principais

O projeto GitHub Search oferece as seguintes funcionalidades principais:

1. **Pesquisa de Repositórios**: Os usuários podem inserir palavras-chave na barra de pesquisa para encontrar repositórios do GitHub relacionados a essas palavras-chave. Os resultados incluem detalhes como nome do repositório, descrição, linguagem de programação predominante e número de estrelas.

2. **Pesquisa de Usuários**: Os usuários também podem buscar por outros usuários do GitHub. Os resultados exibem informações sobre o perfil do usuário, incluindo nome, avatar, nome de usuário, número de seguidores e repositórios públicos.

3. **Detalhes do Repositório**: Ao clicar em um repositório na lista de resultados, os usuários podem visualizar informações mais detalhadas sobre o repositório, como os commits mais recentes e os colaboradores.


Primeiro,

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) com seu browser de preferencia para ver o resultado.


## Tecnologias Utilizadas

1. **@tanstack/react-query** (v4.35.3)

    Motivo de Uso: O React Query é uma biblioteca que oferece uma solução eficaz para gerenciar o estado e a lógica de busca de dados em aplicativos React. Ela simplifica a busca, a atualização e o gerenciamento de dados, tornando as solicitações de API mais eficientes e escaláveis.

2. **ky** (v1.0.1)

    Motivo de Uso: Ky é uma biblioteca para realizar solicitações de rede HTTP no navegador e no Node.js. Ela oferece uma API moderna e amigável, alem de uma integração melhor as novas funcionalidades no next13 para fazer requisições assíncronas a servidores. Ky é uma escolha popular para lidar com chamadas de API em projetos React devido à sua simplicidade e recursos.

3. **react-icons** (v4.11.0)

    Motivo de Uso: O pacote React Icons fornece uma ampla variedade de ícones que podem ser facilmente incorporados em componentes React. Isso é útil para adicionar ícones a elementos de interface do usuário, como botões, links e barras de navegação, tornando a aplicação mais atraente e intuitiva.

4. **styled-components** (v6.0.8)

    Motivo de Uso: O styled-components é uma biblioteca que permite criar estilos CSS em JavaScript para componentes React. Com ela, você pode definir estilos de maneira declarativa diretamente nos componentes, facilitando a manutenção e a compreensão do CSS da aplicação. É amplamente utilizado para criar interfaces de usuário elegantes e responsivas.

5. **typescript** (v5.2.2)

    Motivo de Uso: TypeScript é uma linguagem de programação que adiciona tipagem estática ao JavaScript. Ele ajuda a identificar erros de código em tempo de desenvolvimento, tornando o código mais seguro e fácil de manter. O Next.js pode ser configurado para funcionar perfeitamente com o TypeScript, oferecendo uma experiência de desenvolvimento mais robusta e escalável.


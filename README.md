# Search Github Repo

Eu como cliente gostaria de realizar a pesquisa de repositórios do GitHub.

# Requisitos para a execução do projeto

- É necessário que o node esteja instalado

  > [Instalando o Node](https://nodejs.org/pt-br/download/package-manager/ 'Clique aqui para aprender a instalar o Node!')

# Descrição do projeto

<strong>Front-end: Javascript Vanilla</strong>

  > Pasta "Front-end"
  
  > Utilizei "axios" para realizar a integração com o back-end
  
  > Utilizei módulos do Javascript para que o código permaneça organizado
  
  > Houve a necessidade de utilizar fonts do Google para auxiliar no projeto
  
- Executar o Front-end

  > npm install
  
  > npm run dev
  
  > Ou se preferir utilizar a extensão "Live Server" do VsCode.

<strong>Back-end: ambiente NodeJS</strong>

  > Pasta "Back-end"
  
  > Para realizar a consulta na API do GitHub utilizei uma controller e o "axios" para realizar o método GET
  
  > Houve a necessidade de realizar a minha rota para que o front-end consumisse o resultado
  
  > Deste modo, determinei que a rota seria "/SearchRepository/GitHub/:repos" na porta 3333

- Executar o Back-end

  > npm install
  
  > npm run dev

# Versão final do projeto

- O projeto deve ter somente uma tela e a pesquisa acontece após o "Enter". A cada 10 registros o sistema realiza a paginação.

Partes do sistema:

![Screenshot_1](https://user-images.githubusercontent.com/41653026/191869583-49101bb1-0de3-49a9-ba2f-412355800369.png)
![image](https://user-images.githubusercontent.com/41653026/191869607-bea5facc-a30d-4cad-9a36-4979ada14162.png)

DOCUMENTAÇÃO DO PROJETO
===========================================


## **ESTRUTURA DO BANCO**
 
Foram criados dois bancos no [mlab](https://mlab.com) sendo um para a aplicação e outro para rodar os testes de integração, com as seguintes URIs de conexão:

 **Banco principal:** `mongodb://admin:admin123@ds133041.mlab.com:33041/ticketalimentacao`

**Banco de teste:** `mongodb://admin:admin123@ds159926.mlab.com:59926/ticketalimentacao-test`

O resource escolhido para esse projeto foi estabelecimentos que aceitam o ticket refeição. Assim, a seguinte modelagem da entidade foi projetada:

    est_nome: String required,
    est_descricao: String,
    est_endereco: String required,
    est_telefone: Number required

<br/>

## **DESCRIÇÃO DA API**

A porta 8888 está exposta, e a partir dela é possível acessar a API de resources:

- **GET**
  - **Listagem paginada:** Para consultar todos os recursos cadastrados no banco, basta acessar http://localhost:8888/resources, e caso deseje mudar de página só é preciso adicionar o parametro `page` na url, http://localhost:8888/resources?page=1. <br/>
  Vale ressaltar que caso seja enviado como parametro um número menor que 0, um erro com status 500 será retornado da aplicação.

  - **Listagem de recurso específico:** Para buscar um recurso específico é necessário acessar http://localhost:8888/resources/:id, sendo o `id` o identificador do resource.

- **POST**
  - **Criação de novo recurso:** A partir de http://localhost:8888/resources é possível criar um novo recurso, porém deve ser enviado no corpo da request do POST um objeto JSON, por exemplo:

        {
          "est_nome": "Fran's Café",
          "est_endereco": "Rua Antônio de Godoy, 3822",
          "est_telefone": 1732224133
        }

     Caso alguma das propriedades do objeto acima não estejam presente no corpo da request, um erro será retornado do servidor.

- **PUT**
  - **Atualização de um recurso:** Esse método HTTP é responsável por atualizar um recurso por completo por meio url http://localhost:8888/resources/:id, assim é necessário enviar um objeto JSON semelhante ao exibido no POST.  <br/>
  Vale ressaltar também que caso não exista nenhum recurso com o `id` informado, um novo objeto será criado no banco.

- **PATCH**
  - **Atualização parcial de um recurso:** Para atualizar parcialmente um recurso, basta acessar http://localhost:8888/resources/:id, e enviar no corpo da request do PATCH as propriedades que serão atualizadas, conforme exemplificado abaixo:
  
        {
          "est_descricao": "uma nova descriação criada",
          "est_telefone": "1723456780
        }
    
    Vale ressaltar que caso o `id` informado não exista, um 404 será respondido pelo servidor.

- **DELETE**
  - **Exclusão de um recurso:** Por meio da url http://localhost:8888/resources/:id é possível excluir um recurso específicado pelo `id`.

<br/>

## **Resumo das rotas da API**

| Método | URL  | Comportamento realizado                              | 
|--------|------|------------------------------------------------------|
| GET    | /resources     | Listagem paginada dos recursos             | 
| GET    | /resources/:id | Recupera um recurso especificado pelo id   | 
| POST   | /resources     | Insere um novo recurso                     | 
| PUT    | /resources/:id | Altera um recurso existente ou cria um novo| 
| PATCH  | /resources/:id | Altera parcialmente um recurso existente   | 
| DELETE | /resources/:id | Exclui um recurso existente                |

<br/>

## **EXECUTANDO O PROJETO**

Foi criado no **package.json** dois scripts para iniciar a aplicação e rodar os testes de integração, mas antes de executar qualquer um desses dois scripts é necessário seguir os seguintes passos:
  1. Baixar as dependencias da aplicação
        
          npm install

  1. Entrar na pasta raiz do projeto e executar:
          
          npm start

  1. Caso queira rodar os testes basta executar nessa mesma pasta o seguinte comando:
  
          npm test

  **Obs:** É necessário ter conexão com a internet para poder realizar a conexão com o banco da aplicação.

----------

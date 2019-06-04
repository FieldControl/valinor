Api Senhor dos anéis

-- Foi desenvolvida usando nodejs, postgresql, além das bibliotecas

-- O sequelize é uma ORM

--Exemplo:
Um insert -> resources.create({nome, personagem, descricao})

resources é uma entidade, geralmente você mapeia e ele gera o banco de dados sozinho pra vc... Mas como já tinha o banco pronto, eu utilizei uma biblioteca chamada
sequelize-auto.. Ela faz o inverso, pega um banco pronto e mapeia para o sequelize, resultado disso é a pasta models... Isso porque eu defini essaa pasta na hora da geracao
pelo arquivo generate-orm.js.

-- Deverá ser criado um arquivo .env contendo as informações do banco, principalmente o host, port, user e senha

-- exemplo =
    DB_HOST=seu_host
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=nome_da_sua_base
    DB_DRIVER=postgres
    DB_PORT=5432



--encaminho o dump do banco de dados api coma tabela resources

-- restaurar o banco para utilizar a api

-- get têm 5 opções 

  1- localhost:porta/resources 'Lista todos os dados da tabela'

  2 - localhost:porta/resources?page=10 'lista a page de acordo com o tamanho especificado'

  3 - localhost:porta/resources?nome='nome do personagem'  'Lista de acordo com a propriedade citada'

  4 - localhost:porta/resources?page=2&nome='nome do personagem' 'lista de acordo com a propriedade e o limite de daos da pagina'

  5 - localhost:porta/resources/id 'lista de acordo com o id citado'

-- post 

  "Preencher os dados de acordo com as colunas da tabela, caso fere um erro, irá ser especificado"

-- Put

  localhost:porta/resources/id     'Irá alterar os dados da tabela de acordo com o id, caso seja existente'

-- Patch

  localhost:porta/resources/id 'Irá alterar parcialmente os dados da tabela de acordo com o id, caso seja existente'

-- Delete 

localhost:porta/resources/id 'Irá deletar os dados de acordo com o id, caso seja existente'






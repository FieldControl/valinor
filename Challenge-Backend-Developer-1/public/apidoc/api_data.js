define({ "api": [
  {
    "type": "delete",
    "url": "/personagens/:personagem_id",
    "title": "Exclui um personagem",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "personagem_id",
            "description": "<p>Id do personagem a ser excluído</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "DELETE /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 204 No Content",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "DeletePersonagensPersonagem_id"
  },
  {
    "type": "get",
    "url": "/v1/personagens",
    "title": "Recupera lista de personagens",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "GET /v1/personagens HTTP/1.1",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "personagens",
            "description": "<p>Lista de personagens</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Id do personagem</p>"
          },
          {
            "group": "200",
            "type": "Date",
            "optional": false,
            "field": "create_date",
            "description": "<p>Data de criação do registro</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "nome",
            "description": "<p>Nome do personagem</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "raca",
            "description": "<p>Raça do personagem</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "poder",
            "description": "<p>Nível de poder do personagem</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>Versão do registro</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n {\n     \"_id\": \"5ca2d39e68e445238066b56c\",\n     \"create_date\": \"2019-04-02T03:14:38.218Z\",\n     \"nome\": \"Goku\",\n      \"raca\": \"Sayajin\",\n      \"sexo\": \"Masculino\",\n      \"poder\": 5000000,\n      \"__v\": 0\n  },\n  {\n      \"_id\": \"5ca2d41368e445238066b56d\",\n      \"create_date\": \"2019-04-02T03:16:35.486Z\",\n      \"nome\": \"Vegita\",\n      \"raca\": \"Sayajin\",\n      \"sexo\": \"Masculino\",\n      \"poder\": 4900000,\n      \"__v\": 0\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "GetV1Personagens"
  },
  {
    "type": "get",
    "url": "/v1/personagens/:personagem_id",
    "title": "Recupera um personagem específico",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "personagem_id",
            "description": "<p>Id do personagem a ser recuperado</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "GET /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Id do personagem</p>"
          },
          {
            "group": "200",
            "type": "Date",
            "optional": false,
            "field": "create_date",
            "description": "<p>Data de criação do registro</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "nome",
            "description": "<p>Nome do personagem</p>"
          },
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "raca",
            "description": "<p>Raça do personagem</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "poder",
            "description": "<p>Nível de poder do personagem</p>"
          },
          {
            "group": "200",
            "type": "Number",
            "optional": false,
            "field": "__v",
            "description": "<p>Versão do registro</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5ca2d39e68e445238066b56c\",\n    \"create_date\": \"2019-04-02T03:14:38.218Z\",\n    \"nome\": \"Goku\",\n    \"raca\": \"Sayajin\",\n    \"sexo\": \"Masculino\",\n    \"poder\": 5000000,\n    \"__v\": 0\n}",
          "type": "Object"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Personagem não existe:",
          "content": "HTTP/1.1 404 Not Found",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "GetV1PersonagensPersonagem_id"
  },
  {
    "type": "patch",
    "url": "/personagens/:personagem_id",
    "title": "Atualiza parcialmente um personagem",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "personagem_id",
            "description": "<p>Id do personagem a ser atualizado</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nome",
            "description": "<p>Nome do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "raca",
            "description": "<p>Raça do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sexo",
            "description": "<p>Sexo do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "poder",
            "description": "<p>Nível de poder do personagem</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "PATCH /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1\nContent-Type: application/json\n{\n    \"nome\": \"Goku\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 204 No Content",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "PatchPersonagensPersonagem_id"
  },
  {
    "type": "post",
    "url": "/v1/personagens",
    "title": "Adiciona um novo personagem",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nome",
            "description": "<p>Nome do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "raca",
            "description": "<p>Raça do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sexo",
            "description": "<p>Sexo do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "poder",
            "description": "<p>Nível de poder do personagem</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "POST /v1/personagens HTTP/1.1\nContent-Type: application/json\n{\n    \"nome\": \"Kurilin\",\n    \"raca\": \"Humano\",\n    \"sexo\": \"Masculino\",\n    \"poder\": 49000\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "201": [
          {
            "group": "201",
            "type": "String",
            "optional": false,
            "field": "Location",
            "description": "<p>Header com a localização do recurso inserido</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 Created\nLocation: api/personagens/5ca57e04f5505821c4d04874",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "PostV1Personagens"
  },
  {
    "type": "put",
    "url": "/personagens/:personagem_id",
    "title": "Atualiza completamente um personagem",
    "group": "Personagens",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "personagem_id",
            "description": "<p>Id do personagem a ser atualizado</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nome",
            "description": "<p>Nome do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "raca",
            "description": "<p>Raça do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sexo",
            "description": "<p>Sexo do personagem</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "poder",
            "description": "<p>Nível de poder do personagem</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "PUT /v1/personagens/5ca2d39e68e445238066b56c HTTP/1.1\nContent-Type: application/json\n{\n    \"nome\": \"Kurilin\",\n    \"raca\": \"Humano\",\n    \"sexo\": \"Masculino\",\n    \"poder\": 49000\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 204 No Content",
          "type": "json"
        }
      ]
    },
    "filename": "api/v1/routes.js",
    "groupTitle": "Personagens",
    "name": "PutPersonagensPersonagem_id"
  }
] });

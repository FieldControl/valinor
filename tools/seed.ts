const { gql } = require("apollo-boost")

const { ApolloClient } = require("apollo-client")
const { InMemoryCache } = require('apollo-cache-inmemory')
const { createHttpLink } = require('apollo-link-http')
const nodeFetch = require('node-fetch')
const cuid = require('cuid')

const { appUrl } = require('../src/utils')

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: createHttpLink({ uri: appUrl, fetch: nodeFetch }),
});

const ADD_FINALIZADORA = gql`
mutation inserirFinalizadora($finalizadoraInput: FinalizadoraInput!) {
	inserirFinalizadora(finalizadoraInput: $finalizadoraInput) {
		id
		descricao
	}
}
`

const credito = {
	"finalizadoraInput": {
		"id": "cjld2cjxh0000qzrmn831i7rn",
		"descricao": "Cartão de Cédito"
	}
}

const debito = {
	"finalizadoraInput": {
		"id": "ck6gp97gt0001xkmcpptuq2tb",
		"descricao": "Cartão de Débito"
	}
}

const dinheiro = {
	"finalizadoraInput": {
		"id": "cjld2cyuq0000t3rmniod1foy",
		"descricao": "Dinehiro"
	}
}

client.mutate({
	mutation: ADD_FINALIZADORA,
	variables: credito
}).then(result => {
	console.log(result)
})

client.mutate({
	mutation: ADD_FINALIZADORA,
	variables: debito
}).then(result => {
	console.log(result)
})

client.mutate({
	mutation: ADD_FINALIZADORA,
	variables: dinheiro
}).then(result => {
	console.log(result)
})


const ADD_PRODUTO = gql`
mutation inserirProduto($produtoInput: ProdutoInput!) {
	inserirProduto(produtoInput: $produtoInput) {
		id
		descricao
		codigo
	}
}
`

const coca = {
	"produtoInput": {
		"id": "ck6iaz8ky0000vkmcdrh9auxr",
		"descricao": "coca cola",
		"codigo": "1",
		"preco": 3.25
	}
}

const lanche = {
	"produtoInput": {
		"id": "ck6iaz8ky0000vkmcdrh9auxr",
		"descricao": "LANCHE",
		"codigo": "2",
		"preco": 3.25
	}
}

client.mutate({
	mutation: ADD_PRODUTO,
	variables: coca
}).then(result => {
	console.log(result)
})


client.mutate({
	mutation: ADD_PRODUTO,
	variables: lanche
}).then(result => {
	console.log(result)
})


const ADD_CLIENTE = gql`
mutation inserirCliente(
	$clienteInput: ClienteInput!
	$enderecoInput: EnderecoInput
) {
	inserirCliente(clienteInput: $clienteInput, enderecoInput: $enderecoInput) {
		id
		nome
		telefone
		endereco {
			id
			logradouro
			bairro
			cidade
			cep
		}
	}
}
`

const deneris = {
	"clienteInput": {
		"id": "ck6ib9a3m0001iwmcd6sj0r0s",
		"nome": "Deneris Targuerian",
		"telefone": "17 981938155"
	},
	"enderecoInput": {
		"id": "ck6ib98cv0000iwmcva59zrq6",
		"logradouro": "Sala do trono",
		"bairro": "Pedra do dragao",
		"cidade": "Terras do Rei",
		"cep": "15110000"
	}
}

const leo = {
	"clienteInput": {
		"id": "ck6ib9a3m0001iwmcd6sj0r0s",
		"nome": "Leo Falco",
		"telefone": "17 981166175"
	},
	"enderecoInput": {
		"id": "ck6ib98cv0000iwmcva59zrq6",
		"logradouro": "Rua A",
		"bairro": "Centro",
		"cidade": "Guapiaçu",
		"cep": "15110000"
	},
}

client.mutate({
	mutation: ADD_CLIENTE,
	variables: deneris
}).then(result => {
	console.log(result)
})

client.mutate({
	mutation: ADD_CLIENTE,
	variables: leo
}).then(result => {
	console.log(result)
})
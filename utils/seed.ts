const { gql } = require("apollo-boost")

const { ApolloClient } = require("apollo-client")
const { InMemoryCache } = require('apollo-cache-inmemory')
const { createHttpLink } = require('apollo-link-http')
const nodeFetch = require('node-fetch')
const cuid = require('cuid')

const { appUrl } = require('../src/utils')
const spawn = require('cross-spawn');

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({ uri: appUrl, fetch: nodeFetch }),
});

const LIST_ATENDIMETOS = gql`query {
    atendimentos{
        id
        arquivado
    }
}`

const ADD_FINALIZADORA_DEBITO = gql`
mutation {
	inserirFinalizadora(
		finalizadoraInput: {
			id: "ck6gp97gt0001xkmcpptuq2tb"
			descricao: "Cartão de Débito"
		}
	) {
		id
		descricao
	}
}
`

const ADD_FINALIZADORA_CREDITO = gql`
mutation {
	inserirFinalizadora(
		finalizadoraInput: {
			id: "cjld2cjxh0000qzrmn831i7rn"
			descricao: "Cartão de Cédito"
		}
	) {
		id
		descricao
	}
}
`
const ADD_FINALIZADORA_DINHEIRO = gql`
mutation {
	inserirFinalizadora(
		finalizadoraInput: {
			id: "cjld2cyuq0000t3rmniod1foy"
			descricao: "Dinehiro"
		}
	) {
		id
		descricao
	}
}
`



client.mutate({
    mutation: ADD_FINALIZADORA_DEBITO,
}).then(result => {
    console.log(result)
}).catch((error) => {
    console.log(error)
});


client.mutate({
    mutation: ADD_FINALIZADORA_CREDITO,
}).then(result => {
    console.log(result)
}).catch((error) => {
    console.log(error)
});



client.mutate({
    mutation: ADD_FINALIZADORA_DINHEIRO,
}).then(result => {
    console.log(result)
}).catch((error) => {
    console.log(error)
});

client.query({
    query: LIST_ATENDIMETOS
}).then(result => {
    console.log(result)
}).catch(console.error);




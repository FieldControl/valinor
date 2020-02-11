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

const LIST_ATENDIMETOS = gql`query{
    atendimentos{
        id
        arquivado
    }
}`

const ADD_FINALIZADORA = gql`mutation{
	inserirFinalizadora($finalizadoraInput: FinalizadorInput!}){
		id
		descricao
	}
}`


client.mutation({
    mutation: ADD_FINALIZADORA
}).then(result => {
    console.log(result)
    console.log("saindo")
    process.exit(0)
}).catch(console.error);

client.query({
    query: LIST_ATENDIMETOS
}).then(result => {
    console.log(result)
    console.log("saindo")
    process.exit(0)
}).catch(console.error);




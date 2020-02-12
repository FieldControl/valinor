const { gql } = require("apollo-boost")

const { ApolloClient } = require("apollo-client")
const { InMemoryCache } = require('apollo-cache-inmemory')
const { createHttpLink } = require('apollo-link-http')
const nodeFetch = require('node-fetch')
const cuid = require('cuid')

const { appUrl } = require('./config')

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

const promisses = []

promisses.push(
	client.mutate({
		mutation: ADD_FINALIZADORA,
		variables: credito
	}).then(result => {
		console.log(result)
	})
)

promisses.push(
	client.mutate({
		mutation: ADD_FINALIZADORA,
		variables: debito
	}).then(result => {
		console.log(result)
	})
)

promisses.push(
	client.mutate({
		mutation: ADD_FINALIZADORA,
		variables: dinheiro
	}).then(result => {
		console.log(result)
	})
)


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

const batataRustica = {
	"produtoInput": {
		"id": "ck6ifmhpr0000rkmc7w1oa6rx",
		"descricao": "Batata Rustica",
		"codigo": "2",
		"preco": 5.00
	}
}

const lanche = {
	"produtoInput": {
		"id": "ck6ie63v20000t0mchqmf10et",
		"descricao": "Lanche",
		"codigo": "2",
		"preco": 18.75
	}
}

promisses.push(
	client.mutate({
		mutation: ADD_PRODUTO,
		variables: coca
	}).then(result => {
		console.log(result)
	})
)

promisses.push(
	client.mutate({
		mutation: ADD_PRODUTO,
		variables: lanche
	}).then(result => {
		console.log(result)
	})
)

promisses.push(
	client.mutate({
		mutation: ADD_PRODUTO,
		variables: batataRustica
	}).then(result => {
		console.log(result)
	})
)


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
		"id": "ck6idyuvt0000fsmc8qxp6feo",
		"nome": "Deneris Targuerian",
		"telefone": "17 981938155"
	},
	"enderecoInput": {
		"id": "ck6idz6jf0000fgmc4qygd3pb",
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

promisses.push(
	client.mutate({
		mutation: ADD_CLIENTE,
		variables: deneris
	}).then(result => {
		console.log(result)
	})
)

promisses.push(
	client.mutate({
		mutation: ADD_CLIENTE,
		variables: leo
	}).then(result => {
		console.log(result)
	})
)

const ABRIR_ATENDIMENTO = gql`# Write your query or mutation here
mutation abrirAtendimento($atendimentoInput: AtendimentoInput!) {
	abrirAtendimento(atendimentoInput: $atendimentoInput) {
		id
		dataAbertura
		dataEncerramento
		status
		valorPedido
		valorEntrega
		valorTotal
		cliente {
			id
			nome
		}
		enderecoEntrega {
			id
			logradouro
			bairro
			cidade
			cep
		}
		itens {
			id
			quantidade
			precoUnitario
			valor
			produto {
				id
				descricao
				codigo
			}
		}
		pagamentos {
			id
			valor
			troco
			finalizadora {
				id
				descricao
			}
		}
	}
}
`

const atendimentoDeneris = {
	"atendimentoInput": {
		"id": "ck6iexb0f0002g0mcn11ur1u3",
		"idCliente": "ck6ib9a3m0001iwmcd6sj0r0s"
	}
}


const LANCAR_ITEM = gql`
mutation lancarItem($idAtendimento: String!, $itemInput: ItemInput!) {
	lancarItem(idAtendimento: $idAtendimento, itemInput: $itemInput) {
		id
		valorEntrega
		valorPago
		valorTotal
		itens {
			id
			cancelado
			quantidade
			precoUnitario
			valor
			produto {
				id
				descricao
				codigo
				preco
			}
		}
	}
}	
`

const cocaParaDeneris = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"itemInput": {
		"id": "ck6if4abv0001mcmcji580iva",
		"idProduto": "ck6iaz8ky0000vkmcdrh9auxr",
		"quantidade": 2,
		"cancelado": false
	}
}

const lancheParaDeneris = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"itemInput": {
		"id": "ck6if4abv0001mcmcji580iva",
		"idProduto": "ck6iaz8ky0000vkmcdrh9auxr",
		"quantidade": 2,
		"cancelado": false
	}
}

const batataRusticaParaDeneris = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"itemInput": {
		"id": "ck6ifncjw0000uomchtxo4vw1",
		"idProduto": "ck6ifmhpr0000rkmc7w1oa6rx",
		"quantidade": 1,
		"cancelado": false
	}
}

const LANCAR_PAGAMENTO = gql`
mutation lancarPagamento(
	$idAtendimento: String!
	$pagamentoInput: PagamentoInput!
) {
	lancarPagamento(
		idAtendimento: $idAtendimento
		pagamentoInput: $pagamentoInput
	) {
		id
		valorPedido
		valorEntrega
		valorTotal
		valorPago
		pagamentos {
			id
			cancelado
			valor
			troco
			finalizadora {
				id
				descricao
			}
		}
	}
}
`

const pagamentoNoDinheiroComTroco = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"pagamentoInput": {
		"id": "ck6ijfmos0000gomceyst06p0",
		"valor": 10,
		"troco": 5,
		"idFinalizadora": "cjld2cyuq0000t3rmniod1foy"

	}
}

const AUDITAR_EARQUIVAR = gql`
mutation auditarEArquivar($idAtendimento: String!) {
	auditarEArquivar(idAtendimento: $idAtendimento) {
		id
		dataAbertura
		dataEncerramento
		status
		valorPedido
		valorEntrega
		valorTotal
		cliente {
			id
			nome
		}
		enderecoEntrega {
			id
			logradouro
			bairro
			cidade
			cep
		}
		itens {
			id
			quantidade
			precoUnitario
			valor
			produto {
				id
				descricao
				codigo
			}
		}
		pagamentos {
			id
			valor
			troco
			finalizadora {
				id
				descricao
			}
		}
	}
}
`
const auditarAtendimento = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3"
}

const ALTERAR_STATUS = gql`
mutation alterarStatus($idAtendimento: String!, $status: Status!) {
	alterarStatus(idAtendimento: $idAtendimento, status: $status) {
		status
	}
}
`

const confirmado = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"status": "CONFIRMADO"
}

const emEntrega = {
	"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
	"status": "EM_ENTREGA"
}


Promise.all(promisses) // aguardar todos os cadastro serem realizados
	.then(() => { // provavelmente vai dar problema lançar itens de maneira concorrente ...

		console.log(atendimentoDeneris)
		return client.mutate({
			mutation: ABRIR_ATENDIMENTO,
			variables: atendimentoDeneris
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(cocaParaDeneris)
		return client.mutate({
			mutation: LANCAR_ITEM,
			variables: cocaParaDeneris
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(lancheParaDeneris)
		return client.mutate({
			mutation: LANCAR_ITEM,
			variables: lancheParaDeneris
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(batataRusticaParaDeneris)
		return client.mutate({
			mutation: LANCAR_ITEM,
			variables: batataRusticaParaDeneris
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(confirmado)
		return client.mutate({
			mutation: ALTERAR_STATUS,
			variables: confirmado
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(emEntrega)
		return client.mutate({
			mutation: ALTERAR_STATUS,
			variables: emEntrega
		}).then((result) => {
			console.log(result)
		})
	}).then(() => {
		console.log(pagamentoNoDinheiroComTroco)
		return client.mutate({
			mutation: LANCAR_PAGAMENTO,
			variables: pagamentoNoDinheiroComTroco
		})
	}).then((result) => {
		const pagamentoNoCartao = {
			"idAtendimento": "ck6iexb0f0002g0mcn11ur1u3",
			"pagamentoInput": {
				"id": "ck6ijimmz0000wcmc6ktf475q",
				"valor": result.data.lancarPagamento.valorTotal - result.data.lancarPagamento.valorPago,
				"idFinalizadora": "cjld2cjxh0000qzrmn831i7rn"

			}
		}
		console.log(pagamentoNoCartao)
		return client.mutate({
			mutation: LANCAR_PAGAMENTO,
			variables: pagamentoNoCartao
		}).then((result) => {
			console.log("teste7")
			console.log(result)
		})
	}).then(() => {
		console.log(auditarAtendimento)
		return client.mutate({
			mutation: AUDITAR_EARQUIVAR,
			variables: auditarAtendimento
		}).then((result) => {
			console.log(result)
		})
	})
	.catch(erro => {
		console.log(JSON.stringify(erro))
	})

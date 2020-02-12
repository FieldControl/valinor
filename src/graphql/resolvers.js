const helloService = require('../services/hello-service')
const produtoService = require('../services/produto-service')
const finalizadoraService = require('../services/finalizadora-service')
const clienteService = require('../services/cliente-service')
const atendimentoService = require('../services/atendimento-service')

const Query = {
  hello: (_, { nome }, context, info) => {
    return helloService.hello(nome)
  },

  produtos: async (_, args, { prisma }, info) => {
    return produtoService.list(prisma)
  },

  finalizadoras: async (_, args, { prisma }, info) => {
    return finalizadoraService.list(prisma)
  },

  clientes: async (_, args, { prisma }, info) => {
    return clienteService.list(prisma)
  },

  atendimentos: async (_, { skip, first }, { prisma }, info) => {
    return atendimentoService.list(prisma, { skip, first })
  },

  atendimento: async (_, { id }, { prisma }, info) => {
    return atendimentoService.find(prisma, id)
  }
}

const Mutation = {

  inserirProduto: async (_, { produtoInput }, { prisma }, info) => {
    return produtoService.save(prisma, produtoInput)
  },

  inserirFinalizadora: async (_, { finalizadoraInput }, { prisma }, info) => {
    return finalizadoraService.save(prisma, finalizadoraInput)
  },

  inserirCliente: async (_, { clienteInput, enderecoInput }, { prisma }, info) => {
    return clienteService.save(prisma, { clienteInput, enderecoInput })
  },

  abrirAtendimento: async (_, { atendimentoInput }, { prisma }, info) => {
    return atendimentoService.abrirAtendimento(prisma, atendimentoInput)
  },

  lancarItem: async (_, { idAtendimento, itemInput }, { prisma }, info) => {
    return atendimentoService.lancarItem(prisma, { idAtendimento, itemInput })
  },

  alterarStatus: async (_, { idAtendimento, status }, { prisma }, info) => {
    return atendimentoService.alterarStatus(prisma, { idAtendimento, status })
  },

  lancarPagamento: async (_, { idAtendimento, pagamentoInput }, { prisma }, info) => {
    return atendimentoService.lancarPagamento(prisma, { idAtendimento, pagamentoInput })
  },

  auditarEArquivar: async (_, { idAtendimento }, { prisma }, info) => {
    return atendimentoService.auditarEArquivar(prisma, idAtendimento)
  }
}

module.exports = {
  Query,
  Mutation
}

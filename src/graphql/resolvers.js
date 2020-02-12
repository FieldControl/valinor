const helloService = require('../services/helloService');
const produtoService = require('../services/produtoService');
const finalizadoraService = require('../services/finalizadoraService')
const clienteService = require('../services/clienteService')
const atendimentoService = require('../services/atendimentoService')

const Query = {
    hello: (_, { nome }, context, info) => {
        return helloService.hello(nome)
    },

    produtos: async (_, args, { prisma }, info) => {
        return await produtoService.list(prisma);
    },

    finalizadoras: async (_, args, { prisma }, info) => {
        return await finalizadoraService.list(prisma)
    },

    clientes: async (_, args, { prisma }, info) => {
        return await clienteService.list(prisma);
    },

    atendimentos: async (_, { skip, first }, { prisma }, info) => {
        return await atendimentoService.list(prisma, { skip, first });
    },

    atendimento: async (_, { id }, { prisma }, info) => {
        return await atendimentoService.find(prisma, id);
    },
}

const Mutation = {

    inserirProduto: async (_, { produtoInput }, { prisma }, info) => {
        return produtoService.save(prisma, produtoInput)
    },

    inserirFinalizadora: async (_, { finalizadoraInput }, {prisma}, info) => {
        return finalizadoraService.save(prisma, finalizadoraInput)
    },

    inserirCliente: async (_, { clienteInput, enderecoInput }, { prisma }, info) => {
        return await clienteService.save(prisma, { clienteInput, enderecoInput });
    },

    abrirAtendimento: async (_, { atendimentoInput }, { prisma }, info) => {
        return atendimentoService.abrirAtendimento(prisma, atendimentoInput)
    },

    lancarItem: async (_, { idAtendimento, itemInput }, { prisma }, info) => {
        return await atendimentoService.lancarItem(prisma, { idAtendimento, itemInput })
    },

    alterarStatus: async (_, { idAtendimento, status }, { prisma }, info) => {
        return atendimentoService.alterarStatus(prisma, { idAtendimento, status })
    },

    lancarPagamento: async (_, { idAtendimento, pagamentoInput }, { prisma }, info) => {
        return await atendimentoService.lancarPagamento(prisma, { idAtendimento, pagamentoInput })
    },

    auditarEArquivar: async (_, { idAtendimento }, { prisma }, info) => {
        return await atendimentoService.auditarEArquivar(prisma, idAtendimento);
    }
}

module.exports = {
    Query,
    Mutation
}
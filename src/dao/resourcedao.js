const { resources } = require('../models');

module.exports = function (app) {

    const {argv} = process

    const page = argv[2]
    /**
     * Recupera todos os registros do banco de dados
     */
    this.recuperarTudo = function () {
        return resources.findAll()
    }

     /**
     * Recupera todos os registros, porém com limites
     */
    this.allLimite = function (limite) {
        return resources.findAll({limit: limite,
        skip: (page - 1) * limite})
    }
    
     /**
     * Recupera os registros de acordo com a busca
     */
    this.busca = function (nome) {
        return resources.findAll({
            where: {
                nome: nome
            }
        })
    }
    
     /**
     * Recupera os registros com limite e a busca
     */
    this.limiteBusca = function (limite, nome) {
        return resources.findAll({limit: limite,
        skip: (page - 1) * limite,
        where: {
            nome: nome
        }
        })
    }

    /**
     * Adiciona um novo recurso
     */
    this.adicionarRecurso = function (dados){
        
        const {nome, personagem, descricao } = dados
            return  resources.create({nome, personagem, descricao})
    }

    /**
     * Recupera um recurso por ID
     */
    this.recuperaPorId = function(id) {
        return resources.findByPk(id)
    }

    this.alteraDados = function (id, dados) {
        const {nome, personagem, descricao } = dados 
        return resources.update({nome, personagem, descricao}, {
            where: {
                id: id
            }
        });
    }

     /**
     * exclui um regitro pelo id
     */
    this.excluirDado = function (id) {
        return resources.destroy({
            where: {
                id: id
            }
        });
    }

    return this;
}
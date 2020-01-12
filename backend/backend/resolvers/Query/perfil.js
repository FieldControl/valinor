// a função do arquivo db contido na pasta config, é passada para 
// a constante db.
const db = require('../../config/db')

module.exports = {
    // É retornada uma query contendo todos os tipos de perfis, para
    // usuarios do tipo administrador.
    perfis(parent,args,ctx) {
        ctx && ctx.validarAdmin()
        return db('perfis')
    },
    perfil(_, { filtro }, ctx) {
        ctx && ctx.validarAdmin()
        //se o filtro não existir, retorne nulo. Se existir 
        if(!filtro) return null
        // o objeto de parametro filtro recebe o valor do objeto const.
        // que é formado por id e nome
        const { id, nome } = filtro

        // Se o id estiver setado, então é retornado uma query na tabela
        // perfis, aonde estiver o id setado, garantindo que somente ele 
        // ira retornar, usando a função first(), se o nome estiver setado
        // é retornado uma query na tabela perfis, aonde estiver o nome 
        // setado. Caso nenhuma das condições forem satifeitas, e retornado
        // nulo.

        if(id) {
            return db('perfis')
                .where({ id })
                .first()

        } else if(nome) {

            return db('perfis')
                .where({ nome })
                .first()

        } else {
            return null
        }
    }
}
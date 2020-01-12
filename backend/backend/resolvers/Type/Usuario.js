const db = require('../../config/db')
// metodo para juntar o id da tabela perfil, com o perfil_id da tabela 
// usuario_perfis
module.exports = {
    perfis(usuario) {
        return db('perfis')
            .join(
                'usuarios_perfis',
                'perfis.id',
                'usuarios_perfis.perfil_id'
            )
            .where({ usuario_id: usuario.id })
    }
}
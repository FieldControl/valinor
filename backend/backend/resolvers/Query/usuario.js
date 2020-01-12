// o metodo knexfile que esta contido no arquivo db.js é passado
// para a constante db
const db = require('../../config/db')
//biblioteca bcrypt-node js é instanciada na constante bcrypt
const bcrypt = require('bcrypt-nodejs')
// função que verifica se o usuario foi logado,é passada no objeto const
// getUsuarioLogado
const {getUsuarioLogado} = require('../Comum/usuario')

module.exports = {
    // metodo assincrono de Login, os dados são passados como um objeto
    // no segundo parametro.
    async Login(_, { dados }){
        // a constante usuario recebe um await que espera a busca na tabela
        // usuarios, aonde o email passado pelo usuario é validado com o 
        // email que está no banco de dados, passando tambem a função first
        // que garante que apenas a linha requisitada sera trazida.
        const usuario = await db('usuarios')
        .where({ email: dados.email })
        .first()

    // se o usuario não existir, ou não estiver setado, e garantido que 
    // o email não foi cadastrado
    if(!usuario) {
        throw new Error('email não cadastrado ou inválido')
    }
    //metodo de comparação de senhas
    const equals = bcrypt.compareSync(dados.senha,
        usuario.senha) 
    //se a senha não for igual a senha criptografada, é gerado um novo erro
    if(!equals) {
        throw new Error('Senha inválida')
    }
    // caso tudo estiver corretamente setado, o usuario é logado.
    return getUsuarioLogado(usuario)

    },

    // é retornado uma lista de usuarios da tabela usuarios para usuarios
    // que forem administradores.
    usuarios(parent,args,ctx) {
        
        ctx && ctx.validarAdmin()

        return db('usuarios')
    },
    // metodo para filtrar o usuario logado usando id e/ ou email, ou 
    // se o usuario for administrador, ele poderá consultar os outros
    // usuarios.
    usuario(_, { filtro }, ctx) {
        // se o objeto filtro passado por parametro não existir, ou 
        // não estiver setado, é retornado nulo.
        ctx && ctx.validarUsuarioFiltro(filtro)

        if(!filtro) return null
        // Caso exista, o valor do objeto composto por id e email é atribuido
        // ao objeto filtro.
        const { id, email } = filtro
        //verifica se o filtro foi feito por id
        if(id) {
            return db('usuarios')
                .where({ id })
                .first()
        } else if(email) { //verifica se o filtro foi feito por email 
            return db('usuarios')
                .where({ email })
                .first()
        } else { // caso não haja nenhum filtro, é retornado nulo
            return null
        }
    },
}
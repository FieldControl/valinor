// constante que chama a biblioteca jwt-simple
const jwt = require('jwt-simple')
/* a função obterPerfis que está no arquivo usuario do diretorio type,  
é chamada na constante perfis que recebe um alias obterPerfis. */
const {perfis:obterPerfis} = require('../Type/Usuario')

module.exports = {
    //função assincrona getUsuarioLogado que contem um usuario
    // é exportada
    async getUsuarioLogado(usuario){
        // metodo para obter perfis é passado com await para a constante
        // perfis.
        const perfis = await obterPerfis(usuario)
        // constante agora, recebe a divisão da função math.floor
        // dividindo a data atual por 1000
        const agora = Math.floor(Date.now()/ 1000)

        // a constante usuarioInfo recebe um objeto que contem n valores,
        // representativos de um paylod para criação do token, incluido 
        // a data de emissão e a data de expiração do token.
        const usuarioInfo = {
            id:usuario.id,
            nome:usuario.nome,
            email:usuario.email,
            perfis:perfis.map(p => p.nome),
            iat:agora,
            exp:agora + (3*24*60*60)

        }
        // constante authSecret recebe o valor da variavel de ambiente 
        // process.env.APP_AUTH_SECRET, que é a chave secret de autenticação
        const authSecret = process.env.APP_AUTH_SECRET
        // Apartir disso é retornado um objeto composto, utilizando-se do ponteiro spread
        // para chamar o objeto usuarioInfo e o token que contem a função 
        // de encodificação chamado jwt.encode(), que por sua vez recebe o payload,
        // que é o usuarioInfo, e a variavel de ambiente process.env.APP_AUTH_SECRET
        // que para facilitar o entendimento foi passada para uma constante chamada authSecret.
        return{
            ...usuarioInfo,
            token:jwt.encode(usuarioInfo,authSecret)
        }
    }
}
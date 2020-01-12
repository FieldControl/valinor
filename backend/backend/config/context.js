const jwt = require('jwt-simple')

module.exports = async ({req}) =>{
    // Em desenvolvimento, caso queira testar um usuario simulado, basta
    // descomentar a linha abaixo: 
    await require('./simulandoLogin')(req)


    const auth = req.headers.authorization
    // console.log(auth)
    
    const token = auth && auth.substring(7)

    let usuario = null
    let admin = false

    if(token){
        try {
            let contentToken = jwt.decode(token, process.env.APP_AUTH_SECRET)
            if(new Date(contentToken.exp * 1000)> new Date()){
                usuario = contentToken
            }
        } catch (e) {
            // token inválido

        }
    }
    
    if(usuario && usuario.perfis){
        admin = usuario.perfis.includes('admin')
    }

    const err = new Error('Denied Acess')
    
    
    return {
        usuario,
        admin,
        validarUsuario() {
            if(!usuario) throw err
        },
        validarAdmin(){
            if(!admin) throw err
        },
        validarUsuarioFiltro(filtro){
            if(admin) return 

            if(!usuario) throw err
            if(!filtro) throw err

            const { id, email } = filtro 
            
            if(!id && !email) throw err
            if(id && id !== usuario.id) throw err
            if(email && email !== usuario.email) throw err
        }
    }
}
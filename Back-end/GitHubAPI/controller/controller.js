const axios = require('axios');

module.exports = {
    async searchRepositoryGitHub(request, response){
        const { repos } = request.params;

        await axios.get('https://api.github.com/search/repositories?q=' + repos).then(function(resposta){
            console.log(resposta.data);
            
            return response.send(resposta.data);

        }).catch((err) =>{
            response.json({message: "Repositório não encontrado!" + err});
        })
    }
}
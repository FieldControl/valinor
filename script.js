function search() {
    let res = document.querySelector('.res')
    res.innerHTML = ' '

    let rep = document.getElementById('rep')
    let repTxt = rep.value
    let url = `https://api.github.com/search/repositories?q=${repTxt}`

    if(repTxt.length == 0) {
        alert('Escreva o nome de um repositório')
    }
    else {
        axios(url).then( response => {
            let repos = response.data

            let qtd = document.getElementById('qtd')
            qtd.innerHTML = `${repos.total_count} reps encontrados `

            for(let i = 0; i <= 9; i++){
                let res = document.querySelector('.res')

                let div = document.createElement('div')
                div.classList.add('reps')

                let pName = document.createElement('p')
                pName.innerHTML = repos.items[i].full_name

                let pDescription = document.createElement('p')
                pDescription.innerHTML = repos.items[i].description

                let pStars = document.createElement('p')
                pStars.innerHTML = repos.items[i].stargazers_count

                let pLang = document.createElement('p')
                pLang.innerHTML = repos.items[i].language

                div.appendChild(pName)
                div.appendChild(pDescription)
                div.appendChild(pStars)
                div.appendChild(pLang)
                res.appendChild(div)       
                
            }
        })
    }
}
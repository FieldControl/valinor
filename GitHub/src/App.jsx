import { useState } from 'react'
import './App.css'

function App() {


  const [nome, setNome] = useState("")
  const [pag, setPag] = useState("")



  const handlePag = event => {
    setPag(event.target.value)
  }

  const handleChanger = event => {
    setNome(event.target.value)
  }
  
  var container = document.getElementById("container")
  const handleClick = () => {
    var originalNome = nome.split(" ").join("")
    console.log(`Pagina: ${pag}`)

    fetch("https://api.github.com/search/repositories?q=" + originalNome + "&page=" + pag)
      .then(response => {
        if (!response.ok) {
          window.alert(`Erro na requisição: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        console.log("https://api.github.com/search/repositories?q=" + originalNome + "&page=" + pag)
        //var container = document.getElementById("container")
        for (let i =0; i < 30; i++){
           var nomeCompleto = data.items[i].full_name
           var desc = data.items[i].description
           var forks = data.items[i].forks_count
           var estrelas = data.items[i].stargazers_count
           var upload = data.items[i].updated_at
           var foto = data.items[i].owner.avatar_url

           console.log(`ID:${i}\nNome: ${nomeCompleto}\nDescrição ${desc}\nForks ${forks}\nUpado em ${upload}\nEstrelas ${estrelas}\nFoto URL: ${foto}`)
            var novaDiv = document.createElement("div")
           novaDiv.textContent = `ID:${i}\nNome: ${nomeCompleto}\nDescrição ${desc}\nForks ${forks}\nUpado em ${upload}\nEstrelas ${estrelas}\nFoto URL: ${foto}`
           novaDiv.style.color = "black"
            novaDiv.style.border = "2px solid black"
           container.appendChild(novaDiv)

           
        }
      })
  }
  return (
    <>
      <div id='app'>
        <input min={1} defaultValue={1} onClick={handlePag} type="number" className='btn btn-outline-light' placeholder='Página' />


        <h1 className='text text-primary'>GitHub Repositórios</h1>


        <input type="text" className='form-control' placeholder='Pesquisar repositórios' onChange={handleChanger} />
        <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />

        <div id="container"></div>
      </div>
    </>
  )
}
export default App

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
        if (response.status == "403") {
          window.alert(`Limite de requisições (30)`)
        }
        else if (response.status == "422"){
          window.alert("Por favor, preencha todos os dados")
        }

        return response.json()
      })
      .then(data => {
        console.log("https://api.github.com/search/repositories?q=" + originalNome + "&page=" + pag)
        var container = document.getElementById("container")
        container.innerHTML = ""
        for (let i = 0; i < 30; i++) {
          var nomeCompleto = data.items[i].full_name
          var desc = data.items[i].description
          if (desc == null){
            desc = "Sem descrição"
          }

          var forks = data.items[i].forks_count
          var estrelas = data.items[i].stargazers_count
          var upload = data.items[i].updated_at
          var foto = data.items[i].owner.avatar_url
          var novaDiv = document.createElement("div")


          novaDiv.innerHTML = `<img src="${foto}"/>  <span><p class='btn btn-success'>${nomeCompleto}</p> <br> <p class='btn btn-primary'>${desc}</p><br> <p class='btn btn-primary'>${upload}</p> <span class="material-symbols-outlined">star</span> <span>${estrelas}</span> </span>`
          novaDiv.style.color = "black"
          novaDiv.style.marginTop = "20px"
          novaDiv.style.backgroundColor = "rgb(0, 0, 0, 0.2)"
          novaDiv.style.padding = "10px"
          novaDiv.style.borderRadius = "5px"
          container.appendChild(novaDiv)


        }
      })
  }
  return (
    <>
      <div id='app'>
        <button className='btn btn-outline-primary'>Página</button>
        <br />
        <input min={1} defaultValue={1} onClick={handlePag} type="number" className='btn btn-outline-light' placeholder='Página' />
        

        <h1 className='text text-primary'>GitHub Repositórios</h1>

        <form>
          <input type="text" required="True" className='form-control' placeholder='Pesquisar repositórios' onChange={handleChanger} />
          <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />
          
        </form>

        <br />
        <div className='btn btn-primary' id="container"></div>
      </div>
    </>
  )
}
export default App

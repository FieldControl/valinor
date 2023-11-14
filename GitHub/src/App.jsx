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
        //console.log("https://api.github.com/search/repositories?q=" + originalNome + "&page=" + pag)
        var container = document.getElementById("container")
        //var divRes = document.getElementById("resultados")
        
        //res.innerHTML = ""
        //container.innerHTML = ""
        //console.log(data)
        //var resultado = data.total_count
        
        
        
        //res.innerHTML = `${resultado} resultados`
        
        //window.alert(resultado)
        

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
          var link = data.items[i].html_url
          var novaDiv = document.createElement("div")
          //var res = document.createElement("div")

          novaDiv.style.border = "2px solid blue"
          novaDiv.innerHTML = `<img src="${foto}"/>  <span class="material-symbols-outlined">link</span> <span><a target="_blank" href="${link}">
            <p class='btn btn-success'>${nomeCompleto}</p>
          </a> <br> <p class='btn btn-primary'>${desc}</p><br> <p class='btn btn-primary'>${upload}</p> <br> <span class="material-symbols-outlined">star</span> <span>${estrelas}</span> watchers <br> <span class="material-symbols-outlined">linked_services</span> ${forks} forks </span> `
          novaDiv.style.color = "black"
          novaDiv.style.marginTop = "40px"
          novaDiv.style.backgroundColor = "#272727"
          novaDiv.style.padding = "10px"
          novaDiv.style.borderRadius = "5px"

          container.appendChild(novaDiv)
          //divRes.appendChild(res)


        }
      })
  }
  return (
    <>
      <div id='app'>
        <br />
        <button className='btn btn-outline-primary'>Página</button>
        <br />
        <input min={1} defaultValue={1} onClick={handlePag} type="number" className='btn btn-outline-light' placeholder='Página' />
        

        <h1 className='text text-primary'>GitHub Repositórios</h1>

        <form>
          <input type="text" required="True" className='form-control' placeholder='Pesquisar repositórios' onChange={handleChanger} />
          <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />
          <br />
          <div className='btn btn-danger' id="resultados"></div>
        <br />
        </form>
        <br />
        
        <div className='btn btn-primary' id="container"></div>
        
      </div>
    </>
  )
}
export default App

import { useState } from 'react'
import './App.css'

function App() {

  
  const [nome, setNome] = useState("")

  const handChanger = event => {
    setNome(event.target.value)

  }

  const handleClick = () => {
    var originalNome = nome.split(" ").join("")

    fetch("https://api.github.com/search/repositories?q=" + originalNome)

    .then(response =>{
      if (!response.ok) {
        window.alert(`Erro na requisição: ${response.status}`)
      }

      return response.json()
    })
    .then(data => {
      console.log(data)
      var container = document.getElementById("container")
      var nomeCompleto = data.items[0].full_name
      var desc = data.items[0].description
      var forks = data.items[0].forks_count
      var estrelas = data.items[0].stargazers_count
      var upload = data.items[0].updated_at
      var foto = data.items[0].owner.avatar_url

      console.log(`Nome: ${nomeCompleto}\nDescrição ${desc}\nForks ${forks}\nUpado em ${upload}\nEstrelas ${estrelas}\nFoto URL: ${foto}`)
      window.alert()
    })

  }
  return (
    <>
      <input type="text" placeholder='Página'/>
      <div id='app'>
        <h1 className='text text-primary'>GitHub Repositórios</h1>

        <input type="text" className='form-control' placeholder='Pesquisar repositórios' onChange={handChanger} />

        <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />

        <div id="container">
        Nome: nodejs/node <br />
        Descrição Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles: <br />
        Forks 27642 <br />
        Upado em 2023-11-13T16:19:18Z <br />
        Estrelas 99333 <br />

        Foto URL: https://avatars.githubusercontent.com/u/9950313?v=4 <br />
        </div>


      </div>


    </>
  )
}
export default App

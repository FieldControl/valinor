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
      window.alert("a")
      console.log(data)

      var nomeCompleto = data.items[0].full_name
      console.log(`Nome: ${nomeCompleto}\n`)
    })

  }
  return (
    <>

      <div id='app'>
        <h1 className='text text-primary'>GitHub Repositórios</h1>

        <input type="text" className='form-control' placeholder='Pesquisar repositórios' onChange={handChanger} />

        <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />
      </div>


    </>
  )
}
export default App

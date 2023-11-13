import { useState } from 'react'
import './App.css'

function App() {
  const [nome, setNome] = useState("")

  const handChanger = event => {
    setNome(event.target.value)
  }

  const handleClick = () => {
    window.alert(setNome)
  }
  return (
    <>

      <div id='app'>
        <h1 className='text text-primary'>GitHub Repositórios</h1>

        <input type="text" className='form-control' placeholder='Pesquisar repositórios' />

        <input type="button" className='btn btn-primary' onClick={handleClick} value="Pesquisar" />
      </div>


    </>
  )
}
export default App

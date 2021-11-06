import { useState } from 'react'

import { HeaderContainer } from './styles'
import { AiFillGithub } from 'react-icons/ai'
import { api } from '../../services/api'
import { useGithubData } from '../../hooks/DataContext'

export function Header() {
  const [ searchText, setSearchText ] = useState('')
  const { setGithubData } = useGithubData()

  async function handleSearchData(event) {
    event.preventDefault()

    const response = await api.get(`https://api.github.com/search/repositories?q=${searchText}`)
    console.log(response.data)
    if (response.status === 200) {
      setGithubData(response.data)
    }
  }

  return (
    <HeaderContainer>
      <AiFillGithub size={40}/>
      <form onSubmit={handleSearchData}>
        <input 
          type="text"
          onChange={event => setSearchText(event.target.value)}
          value={searchText}
          placeholder="Digite o nome do repositório"
        />
      </form>
    </HeaderContainer>
  );
}
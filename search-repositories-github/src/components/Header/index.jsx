import { useState } from 'react'

import { HeaderContainer } from './styles'
import { AiFillGithub } from 'react-icons/ai'
import { api } from '../../services/api'
import { useGithubData } from '../../hooks/DataContext'

export function Header() {
  const [ searchText, setSearchText ] = useState('')
  const { getDataRepositories, getIssuesFromRepository } = useGithubData()

  async function handleSearchData(event) {
    event.preventDefault()

    if (searchText.trim() === '') {
      return
    }

    const response = await getDataRepositories(searchText)
    // console.log(response)
  }

  return (
    <HeaderContainer>
      <AiFillGithub size={40}/>
      <form onSubmit={handleSearchData}>
        <input 
          type="text"
          onChange={event => setSearchText(event.target.value)}
          value={searchText}
          placeholder="Search or jump to..."
        />
      </form>
    </HeaderContainer>
  );
}
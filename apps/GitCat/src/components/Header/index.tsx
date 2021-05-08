import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '../../contexts/queryContext'
import InputSearch from '../InputSearch'

import * as S from './styles'

function Header () {

  const [searchQuery, setSearchQuery] = useState('')

  const {setRequestQuerys} = useQuery()

  function sendQuery () {
    setRequestQuerys({page: 1, search: searchQuery, sort: 'full_name', typeSearch: 'repositories' })
  }

  return (
    <S.Container>
      <S.Main>
        <Link to="/">
          <S.Logo />
        </Link>
        <S.SeachArea>
            <InputSearch
              value={searchQuery}
              change={setSearchQuery}
              submit={sendQuery}
              placeholder="Search a repository"
            />
          </S.SeachArea>
      </S.Main>
    </S.Container>
  )
}

export default Header
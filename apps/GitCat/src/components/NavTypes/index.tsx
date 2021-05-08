import React from 'react'
import { useQuery } from '../../contexts/queryContext'

import * as S from './styles'

function NavTypes () {

  const {requestQuerys: {search, typeSearch, sort}, setRequestQuerys} = useQuery()

  const typesSearch = [
    "repositories",
    "issues"
  ]

  const active = typesSearch.findIndex((element) => element === typeSearch ) + 1;

  return (
    <S.Container active={active} >
      {typesSearch.map((name, index) => {
        return (
          <S.Button
            onClick={() => setRequestQuerys({search, sort, typeSearch: name, page: 1})}
            key={index}
          >
            {name}
          </S.Button>
        )
      })}
    </S.Container>
  )
}

export default NavTypes
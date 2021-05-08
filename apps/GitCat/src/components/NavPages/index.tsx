import React from 'react'
import { useQuery } from '../../contexts/queryContext'

import * as S from './styles'

function NavPages () {

  const {requestQuerys: {search, sort, typeSearch ,page}, count, setRequestQuerys} = useQuery()

  let arrayPages = new Array(7)

  let totalPages = Math.round(count/10)

  function changePage (pageNumber: number) {
    window.scroll(0,0)
    setRequestQuerys({search, sort, typeSearch ,page: pageNumber})
  }

  for (let n = -3; n <= 3; n++) {
    if (page <= 3 && totalPages >= 7) {
      arrayPages[n + 3] = n + 4
    } else if (page <= 3 && totalPages < 7) {
      if (page > n + 3) {
        arrayPages[n + 3] = n + 4
      } else {
        break;
      }
    } else {
      arrayPages[n + 3] = page + n
    }
  }

  return (
    <S.Container active={page}>
      {arrayPages.map((element, index) => {
        return( 
          <S.Achor key={index} onClick={() => changePage(element)}>
            {element}
          </S.Achor>
        )
      })}
    </S.Container>
  )
}

export default NavPages
import React, { useEffect, useState } from 'react'
import { useQuery } from '../../contexts/queryContext'

import Header from '../../components/Header'
import NavTypes from '../../components/NavTypes'
import Select from '../../components/Select'
import Card from '../../components/Card'
import NavPages from '../../components/NavPages'

import * as S from './styles'

function Search () {
  const [order, setOrder] = useState({name: 'full_name', display: 'Best Match'})

  const {requestQuerys: {typeSearch, search}, setRequestQuerys, count} = useQuery()
  const selectOptions = [
    {name: 'full_name', display: 'Best Match'},
    {name: 'updated', display: 'Recently Update'}
  ]

  useEffect(() => {
    setRequestQuerys({typeSearch, sort: order.name, page: 1, search})
  }, [order, search, setRequestQuerys, typeSearch])

  return (
    <>
      <Header />
      <S.Content>
        <S.SideMenu>
          <NavTypes />
        </S.SideMenu>
        <S.Main>
          <header>
            <h1>{count} {typeSearch} results</h1>
            <Select value={order} update={setOrder} options={selectOptions} />
          </header>
          <Card />
          <footer>
            <NavPages />
          </footer>
        </S.Main>
      </S.Content>
    </>
  )
}

export default Search
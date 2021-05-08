import React, { useState } from 'react'
import InputSearch from '../../components/InputSearch'
import { useQuery } from '../../contexts/queryContext'

import * as S from './styles'

function Home () {

    const [searchQuery, setSearchQuery] = useState('')
    const {setRequestQuerys} = useQuery()

    function sendQuery () {
        setRequestQuerys({page: 1, search: searchQuery, sort: 'full_name', typeSearch: 'repositories' })
    }

    return (
        <S.Container>
            <S.Main>
                <S.Logo />
                <InputSearch
                    value={searchQuery}
                    change={setSearchQuery}
                    submit={sendQuery}
                    placeholder="Search a repository"
                />
            </S.Main>
        </S.Container>
    )
}

export default Home
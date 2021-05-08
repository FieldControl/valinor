import React from 'react'
import format from 'date-fns/format'
import enUS from 'date-fns/locale/en-US'

import { useQuery } from '../../contexts/queryContext'

import * as S from './styles'

function Card () {

  const {items} = useQuery()

  function formatDate (dateString: string) {
    return format(new Date(dateString), 'dd MMM yyyy', {
      locale: enUS
    })
  }

  return (
    <S.Container>
      {items.map((item, index) => {
        return (
          <S.Board key={index}>
            <S.RepoIcon />
            <a href={item.html_url}>
              <S.RepoName>{item.full_name || item.title}</S.RepoName>
              <S.Description>{item.description}</S.Description>
              {/* <Tags name={item.full_name}/> */}
              <S.Meta>
                {item.license && <p>{item.license.name}</p> }
                {item.updated_at && <p>{`Updated on ${formatDate(item.updated_at)}`}</p>}
              </S.Meta>
            </a>
          </S.Board>
        )
      })}
    </S.Container>
  )
}

export default Card
import React from 'react'

import { BsEye } from 'react-icons/bs'
import { AiOutlineStar } from 'react-icons/ai'

import { RepositoryCardContainer } from './styles'

/**
 * Componente RepositoryModal para renderizar o modal em tela.
 * @param {*} item dados do repositório
 * @param {*} handleOpenModal função para abrir o modal
 * @param {*} setCurrentRepositoryInModal função para setar o estado do componente pai com os dados do repositório
 * @returns RepositoryModal React Component
 */
export function RepositoryCard({ item, handleOpenModal, setCurrentRepositoryInModal }) {
  
  return (
    <RepositoryCardContainer 
      onClick={() => {
        handleOpenModal()
        setCurrentRepositoryInModal(item)
      }}>

      <header>
        <a 
          target="blank" 
          href={item.html_url}>
            {item.full_name}
          </a>
        <p>
          {item.description}
        </p>
      </header>
      {
        item.topics.length > 0 ? (
        <section>
          {
            item.topics.map((topic, index) => (<button key={index} type="button">{topic}</button>))
          }
        </section>
        ) : ('')
      }
      <section>
        <p className="watchers">
          <BsEye size={16} />
          {item.watchers}
        </p>

        <p>
          <AiOutlineStar color={'yellow'} size={16} />
          {item.stargazers_count}
        </p>
        
        <p>
          {item.language}
        </p>

        {
          item.license !== null ? (
            <p>{item.license.name}</p>
          ) : ('')
        }
      </section>
    </RepositoryCardContainer>
  )
}
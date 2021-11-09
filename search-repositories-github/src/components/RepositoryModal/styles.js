import styled from 'styled-components'

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: center;

  width: 50rem;

  padding: 2rem;
`

export const ModalHeader = styled.header`
  margin: 2rem 0;

  p {
    justify-content: center;
    max-width: 22rem;
  }
`

export const OwnerInfo = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    margin-right: 1rem;
  }
`

export const RepositoryInfo = styled.div`
  width: 40rem;

  p {
    display: inline-block;
    margin-right:  0.5rem;
  }
`
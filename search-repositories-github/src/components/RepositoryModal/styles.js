import styled from 'styled-components'

export const ModalContent = styled.div`
  display: flex;
`

export const ModalHeader = styled.header`
  margin: 2rem;

  p {
    justify-content: center;
    max-width: 22rem;
  }
`

export const OwnerInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    margin-right: 1rem;
  }
`
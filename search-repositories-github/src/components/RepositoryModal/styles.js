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

  p.focus {
    background: var(--card-topics-color-primary);
    padding: 0.5rem;
    border-radius: 0.25rem;
    margin-top: 0.25rem;
  }

  section {
    margin: 2rem 0;
    max-height: 4rem;

    h4 {
      margin: 2rem 0;
    }
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;

    a {
      text-decoration: none;
      color: var(--font-color-primary);
      font-weight: 500;
    }

    a:hover {
      text-decoration: underline;
    }

    p:last-child {
      margin-top: 0.2rem;
    }
  }

  article + article {
    border-top: 0.05px solid #ccc;
    margin: 1rem 0;
  }
`
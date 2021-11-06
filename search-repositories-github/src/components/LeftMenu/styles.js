import styled from 'styled-components'

export const LeftMenuContainer = styled.div`
  nav {
    display: flex;
    flex-direction: column;
    width: 20rem;
    border-radius: 0.5rem;

    & {
      border: 1px solid #CCC;
    }

    a {
      display: flex;
      justify-content: space-between;
      align-items: center;

      border-bottom: 1px solid #CCC;
      width: 100%;
      height: 2rem;
      padding: 0.2rem 1rem;

      text-decoration: none;
      color: #000;
      font-weight: 500;

      &.focus {
        background: #bbb;
      }
    }

  }
`
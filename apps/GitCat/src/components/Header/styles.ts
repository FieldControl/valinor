import styled from 'styled-components'
import {margin} from '../../styles/patters'
import {ReactComponent as logo} from '../../assets/images/logo.svg'

export const Container = styled.header`
  height: 3.875rem;
  background: var(--bg-header);
  box-shadow: 0 1px 5px var(--black);
`

export const Main = styled.div`
  ${margin}
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Logo = styled(logo)`
  width: 5rem;
  height: 2.5rem;

  path {
    fill: var(--white);
  }
`

export const SeachArea = styled.div`
  width: 30%;
`
import {Container,Content } from './styles';
import usePagination from '../../hooks/usePagination'

export const Pagination: React.FC = () => {
  const {actualPage,setActualPage} = usePagination()

  return(
    <Container>
      {Array(5).fill('').map((_,index) => {
       return <Content key={index} onClick={() => setActualPage(index + 1)}>
          <button>{index + 1}</button>
        </Content>
      })}
    </Container>
  )
}
import { useRepository } from '../../hooks/useRepository';
import {Container,Content } from './styles';

interface PaginationProps{
  limit: number;
  total: number;
  offset: number;
  setOffset: (value: number) => void;
}

const MAX_ITENS = 7;
const MAX_LEFT = (MAX_ITENS - 1)/ 2;

 export const Pagination: React.FC<PaginationProps> = ({limit ,total, offset , setOffset}) => {
  const current = offset ? (offset / limit) + 1 : 1;
  const pages = Math.ceil(total / limit);
  const first = Math.max(current - MAX_LEFT, 1);
  const {setPage} = useRepository()
  
  function onPageChange(page: number){
    setOffset((page - 1) * limit)
    setPage(page);
  }
  return(
    <Container> 
      <Content>
        {Array.from({length: Math.min(MAX_ITENS, pages)})
        .map((_,index) => index + first)
        .map((page) =>(
          <li key={page}>
            <button type="submit" onClick={() => onPageChange(page) }>
              {page}
            </button>
          </li>
        ))}
        </Content>
    </Container>
  )
}




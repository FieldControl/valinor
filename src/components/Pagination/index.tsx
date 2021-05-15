import {Container,Content } from './styles';

interface PaginationProps{
  limit: number;
  total: number;
  offset: number;
  setOffset: (value: number) => void;
}

const MAX_ITENS = 9;
const MAX_LEFT = (MAX_ITENS - 1)/ 2;

 export const Pagination: React.FC<PaginationProps> = ({limit ,total, offset , setOffset}) => {
  const current = offset ? (offset / limit) + 1 : 1;
  const pages = Math.ceil(total / limit);
  const first = Math.max(current - MAX_LEFT, 1);

  return(
    <Container> 
     <Content>
       {Array.from({length: MAX_ITENS})
       .map((_,index) => index + first)
       .map((pages) =>(
         <li>
           <button onClick={() => setOffset((pages - 1) * limit) }>
             {pages}
           </button>
         </li>
       ))}
      </Content>
    </Container>
  )
}


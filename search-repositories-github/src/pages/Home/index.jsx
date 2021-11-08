import { HomeContainer } from "./styles";
import { useGithubData } from '../../hooks/DataContext'

export function Home() {
  const { data , handleSetCurrentPage, currentPage } = useGithubData()

  return (
    <HomeContainer>
      <div>
        CONTEUDO
      </div>
    </HomeContainer>
  );
}
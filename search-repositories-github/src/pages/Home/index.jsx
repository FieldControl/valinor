import { HomeContainer } from "./styles";
import { useGithubData } from '../../hooks/DataContext'

export function Home() {
  const { data } = useGithubData()

  console.log(data)
  return (
    <HomeContainer>
      <div>
        CONTEUDO
      </div>
    </HomeContainer>
  );
}
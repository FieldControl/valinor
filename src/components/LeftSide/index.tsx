import FilterList from "../FilterList";
import LanguagesList from "../LanguagesList";
import { Container } from "./styles";

const LeftSide: React.FC = () => {
  return (
    <Container>
      <FilterList />
      <LanguagesList />
    </Container>
  );
};
export default LeftSide;

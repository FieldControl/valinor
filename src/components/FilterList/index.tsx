import { Container, Filter, Amount } from "./styles";

const filters = [
  "Repositories",
  "Code",
  "Commits",
  "Issues",
  "Discussions",
  "Packages",
  "Marketplace",
  "Topics",
  "Wikis",
  "Users",
];

const FilterList: React.FC = () => {
  return (
    <Container>
      {filters.map((filter) => {
        return (
          <Filter key={filter}>
            {filter}
            <Amount>15K</Amount>
          </Filter>
        );
      })}
    </Container>
  );
};

export default FilterList;

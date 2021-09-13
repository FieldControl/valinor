import { useContext } from "react";
import { FilterType } from "../../config/constants";
import { IFilter } from "../../config/interfaces";
import GlobalContext from "../../global/GlobalContext";
import { Container, Filter, Amount } from "./styles";

const filters = [
  FilterType.REPOSITORIES,
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
  const { state, setters }: any = useContext(GlobalContext);

  const handleFilterItem = (type: string) => {
    setters.setFilter((filter: IFilter) => ({
      ...filter,
      type,
    }));
  };

  return (
    <Container>
      {filters.map((filter) => {
        return (
          <Filter
            key={filter}
            active={state.filter.type === filter}
            onClick={() => handleFilterItem(filter)}
          >
            {filter}
            <Amount>15K</Amount>
          </Filter>
        );
      })}
    </Container>
  );
};

export default FilterList;

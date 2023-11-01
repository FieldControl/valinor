import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { GetRepositories } from "../../lib/services/getRepositoriesService";
import RepositoryItemContainer from "../../lib/components/RepositoryItemContainer";
import Pagination from "../../lib/components/Pagination";
import { RepositoryItem } from "../../lib/types/RepositoryItem";
import { formatNumber } from "../../lib/helpers/numberHelper";

const App = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    GetRepositories(page)
      .then((res) => {
        setItems(res.items);
        setTotalItems(res.total_count);
      })
      .catch((error) => console.log(error));
  }, [page]);

  return (
    <div className={styles.container}>
      <div>Total de repositórios: {formatNumber(totalItems)}</div>
      {items &&
        items.map((item: RepositoryItem) => {
          return (
            <RepositoryItemContainer
              name={item.name}
              description={item.description}
              language={item.language}
              stargazers_count={item.stargazers_count}
              topics={item.topics}
              updated_at={item.updated_at}
              html_url={item.html_url}
            />
          );
        })}

      <Pagination page={page} setPage={setPage} />
    </div>
  );
};

export default App;

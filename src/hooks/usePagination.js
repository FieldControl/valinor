import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

export default function usePagination() {
  const { urlPage } = Number(useParams());
  const history = useHistory();

  const [actualPage, setActualPage] = useState(urlPage || 1);

  useEffect(() => {
    history.push(`/${actualPage}`);
  }, [actualPage]);

  return {
    setActualPage,
    actualPage,
  };
}

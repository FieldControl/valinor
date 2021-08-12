import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import { SearchInput } from '../../components/SearchInput';

import './styles.scss';

export function Home(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const { push } = useHistory();

  const handleChange = (text: string): void => {
    setSearchQuery(text);
  };

  const handleClick = (): void => {
    if (!searchQuery) {
      toast.error('É necessário informar um repositório para prosseguir');
      return;
    }

    push(`search?repo=${searchQuery}`);
  };

  return (
    <main className="container">
      <section>
        <h1>GitRepos</h1>
        <SearchInput
          value={searchQuery}
          onChange={handleChange}
          onClick={handleClick}
        />
      </section>
    </main>
  );
}

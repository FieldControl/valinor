import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SearchInput } from '../../components/SearchInput';

import './styles.scss';

export function Home(): JSX.Element {
  const [query, setQuery] = useState('');
  const { push } = useHistory();

  const handleChange = (text: string): void => {
    setQuery(text);
  };

  const handleClick = (): void => {
    if (!query) return;

    push(`search?repo=${query}`);
  };

  return (
    <main className="content-container">
      <section>
        <h1>GitRepos</h1>
        <SearchInput
          value={query}
          onChange={handleChange}
          onClick={handleClick}
        />
      </section>
    </main>
  );
}

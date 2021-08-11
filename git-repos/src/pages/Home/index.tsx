import { useState } from 'react';

import { SearchInput } from '../../components/SearchInput';

import './styles.scss';

export function Home(): JSX.Element {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (text: string): void => {
    setQuery(text);
  };

  const handleClick = (): void => {
    console.log('todo');
  };

  return (
    <main className="content-container">
      <section>
        <h1>GitRepos</h1>
        <SearchInput
          isLoading={isLoading}
          value={query}
          onChange={handleChange}
          onClick={handleClick}
        />
      </section>
    </main>
  );
}

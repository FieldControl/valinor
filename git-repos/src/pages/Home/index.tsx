import { MdSearch } from 'react-icons/md';

import './styles.scss';

export function Home(): JSX.Element {
  return (
    <main className="content-container">
      <section>
        <h1>GitRepos</h1>
        <div>
          <input placeholder="Pesquise por um repositório" />
          <button type="button">
            <MdSearch size={30} color="#ffffff" />
          </button>
        </div>
      </section>
    </main>
  );
}

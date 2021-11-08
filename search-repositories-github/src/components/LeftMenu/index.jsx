import { LeftMenuContainer } from './styles'

import { useGithubData } from '../../hooks/DataContext'

export function LeftMenu() {
  const { data } = useGithubData()

  return (
    <LeftMenuContainer>
      <nav>
        <a href="/" className="focus">
          <span>Repositories</span>
          <span>{data.total_count ? data.total_count : 0}</span>
        </a>

        <a href="/">
          <span>Code</span>
          <span>0</span>
        </a>

        <a href="/">
          <span>Issues</span>
          <span>0</span>
        </a>
      </nav>
    </LeftMenuContainer>
  );
}
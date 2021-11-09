import { LeftMenuContainer } from './styles'

import { useGithubData } from '../../hooks/DataContext'

export function LeftMenu() {
  const { data, topics, commits } = useGithubData()


  return (
    <LeftMenuContainer>
      <nav>
        <a href="/">
          <span>Repositories</span>
          <span>{data.total_count ? data.total_count : 0}</span>
        </a>

        <a href="/">
          <span>Commits</span>
          <span>{commits.total_count}</span>
        </a>

        <a href="/">
          <span>Topics</span>
          <span>{topics.total_count}</span>
        </a>
      </nav>
    </LeftMenuContainer>
  );
}
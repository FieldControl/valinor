import { ThemeToggler } from '../ThemeToggler';

import './styles.scss';

export function Header(): JSX.Element {
  return (
    <header>
      <div className="theme-toggler-wrapper">
        <ThemeToggler />
      </div>
    </header>
  );
}

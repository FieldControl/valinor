import { CgMoon, CgSun } from 'react-icons/cg';

import { useTheme } from '../../hooks/useTheme';

import './styles.scss';

export function ThemeToggler(): JSX.Element {
  const { theme, themeToggler } = useTheme();

  return (
    <button
      className="theme-toggler-button"
      type="button"
      onClick={themeToggler}
    >
      <CgMoon
        size={24}
        color={`${theme === 'dark' ? '#765898' : '#e6770b60'}`}
      />
      <CgSun
        size={24}
        color={`${theme === 'light' ? '#e6770b' : '#76589860'}`}
      />
    </button>
  );
}

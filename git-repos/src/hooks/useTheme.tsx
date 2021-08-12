import React, { ReactNode, useContext, useEffect, useState } from 'react';

type ThemeOptions = 'light' | 'dark';

interface IThemeContextData {
  theme: ThemeOptions;
  themeToggler: () => void;
}

const ThemeContext = React.createContext<IThemeContextData>(
  {} as IThemeContextData
);

interface IThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: IThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<ThemeOptions>(() => {
    const storagedTheme = localStorage.getItem('@global-theme') as ThemeOptions;

    if (storagedTheme) {
      return storagedTheme;
    }

    return 'light';
  });

  const themeToggler = (): void => {
    if (theme === 'light') setTheme('dark');
    else setTheme('light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('@global-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeToggler }}>
      <div className={`theme--${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): IThemeContextData {
  return useContext(ThemeContext);
}

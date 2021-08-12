import { renderHook, act } from '@testing-library/react-hooks';

import { ThemeProvider, useTheme } from './useTheme';

describe('useTheme hook', () => {
  it('should be able to store the theme option', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(setItemSpy).toHaveBeenCalledWith('@global-theme', 'light');
  });

  it('should be able to change the theme', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(setItemSpy).toHaveBeenCalledWith('@global-theme', 'light');
    expect(result.current.theme).toEqual('light');

    act(() => {
      result.current.themeToggler();
    });

    expect(setItemSpy).toHaveBeenCalledWith('@global-theme', 'dark');
    expect(result.current.theme).toEqual('dark');
  });
});

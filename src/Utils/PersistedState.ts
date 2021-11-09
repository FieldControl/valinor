/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

function usePersistedState(key: string, initialState: any) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const storageValue = localStorage.getItem(key);

    storageValue ? setState(JSON.parse(storageValue)) : setState(initialState);
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;

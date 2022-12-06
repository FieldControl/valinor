import { useState, useEffect } from 'react';

const useWindowSize = (): {
  width: number | undefined;
  height: number | undefined;
} => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: Number(window.innerWidth),
        height: Number(window.innerHeight),
      });
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
export default useWindowSize;

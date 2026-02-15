import { useEffect } from "react";

export const useDebounce = (
  fn: () => void,
  delay: number,
  deps: unknown[],
) => {
  useEffect(() => {
    const timer = setTimeout(fn, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

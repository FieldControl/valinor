import { useContext } from "react";
import { SearchRepo } from "../context/SearchRepo";

export function useSearch () {
  const value = useContext(SearchRepo);
  return value;
}
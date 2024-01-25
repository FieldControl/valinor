import { Items } from "./Items";

export interface Pesquisa {
  totalCount: number,
  incomplete_results: boolean,
  items: Items[]
}

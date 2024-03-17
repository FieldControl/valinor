export interface CardsResponse {
  id: string;
  title: string;
  description: string;
  columnsTable: {
    id: string;
  };
  user: {
    id: string;
    name: string;
  };
}

export interface Card {
  id: number;
  columnId: number;
  title: string;
  description: string;
}

export interface CreateCardBody {
  columnId: number;
  title: string;
  description: string;
}

export interface EditCardBody {
  columnId: number;
  title: string;
  description: string;
}

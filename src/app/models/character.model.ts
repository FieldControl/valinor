export interface Character {
  comics: {
    available: number
    items: Item[]
  }
  name: string;
  id: string;
  description: string;
  thumbnail: {
    path: string;
    extension: string;
  },
  urls: Url[]
}

export interface CharactersResponse {
  code: number;
  status: string;
  data: {
    offset: number;
    limit: number;
    total: number;
    count: number;
    results: Character[];
  };
}

export interface Item {
    name: string
}

export interface Url {
  type: string
  url: string
}

export interface fileDetails {
  name: string,
  type: string,
}

export interface imagePath {
  [key: string]: string,
}

export interface repoData {
  id: number,
  name: string,
  full_name: string,
  description: string,
  topics: string[],
  updated_at: string,
  language: string,
}

export interface headerProps {
  barVisibily: boolean,
}

export interface cardProps {
  data: {
    id: number,
    name: string,
    full_name: string,
    description: string,
    topics: string[],
    updated_at: string,
    language: string,
  }
}

export interface readmeProps {
  user: string | undefined,
  repo: string | undefined,
}

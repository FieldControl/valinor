export interface Repository {
    total_count: number
    items: Item[]
  }
  
  export interface Item {
    name: string
    owner: Owner
    full_name: string,
    html_url: string
    description: string
    pushed_at: string
    stargazers_count: number
    language: string
    topics: string[]
  }
  
  export interface Owner {
    login: string
    avatar_url: string
  }

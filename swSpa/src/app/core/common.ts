export interface ResultWapper<T> {
    count: number,
    next: string,
    previous: string,
    results: T[]
  }
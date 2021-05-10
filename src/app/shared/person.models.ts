export interface ResponsePeople {
  count: number;
  next: string;
  previous: string;
  results: Person[];
}
export class Person {
  constructor(
    public name: string,
    public height: number,
    public mass: number,
    public hair_color: string,
    public skin_color: string,
    public eye_color: string,
    public birth_year: string,
    public gender: string,
    public homeworld: string,
    public films: string[],
    public species: string[],
    public vehicles: string[],
    public starships: string[],
    public created: string,
    public edited: string,
    public url: string
  ) {}
}

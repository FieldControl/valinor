export interface ResponseStarship {
  count: number;
  next: string;
  previous: string;
  results: Starship[];
}

export class Starship {
  constructor(
    public name: string,
    public model: string,
    public manufacturer: string,
    public cost_in_credits: number,
    public length: number,
    public max_atmosphering_speed: number,
    public crew: string,
    public passengers: number,
    public cargo_capacity: number,
    public consumables: string,
    public hyperdrive_rating: number,
    public MGLT: number,
    public starship_class: string,
    public pilots: string[],
    public films: string[],
    public created: string,
    public edited: string,
    public url: string
  ) {}
}

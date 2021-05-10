export interface ResponsePlanet {
  count: number;
  next: string;
  previous: string;
  results: Planet[];
}

export class Planet {
  constructor(
    public name: string,
    public rotation_period: number,
    public orbital_period: number,
    public diameter: number,
    public climate: string,
    public gravity: string,
    public terrain: string,
    public surface_water: number,
    public population: number,
    public residents: string[],
    public films: string[],
    public created: string,
    public edited: string,
    public url: string
  ) {}
}

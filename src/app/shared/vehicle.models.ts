export interface ResponseVehicle {
  count: number;
  next: string;
  previous: string;
  results: Vehicle[];
}
export class Vehicle {
  constructor(
    public name: string,
    public model: string,
    public manufacturer: string,
    public cost_in_credits: number,
    public length: number,
    public max_atmosphering_speed: number,
    public crew: number,
    public passengers: number,
    public cargo_capacity: number,
    public consumables: string,
    public vehicle_class: string,
    public pilots: string[],
    public films: string[],
    public created: string,
    public edited: string,
    public url: string
  ) {}
}

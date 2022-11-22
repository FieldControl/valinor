export interface Person {
  id: number;
  name: string;
  fullName: string;
  description: string;
  thumbnail: { path: string; extension: string };
  modified: string;
}

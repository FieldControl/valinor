export interface Serie {
  id: number;
  title: string;
  description: string;
  thumbnail: { path: string; extension: string };
  modified: string;
}

export interface Story {
  id: number;
  title: string;
  description: string;
  thumbnail: { path: string; extension: string };
  modified: string;
}

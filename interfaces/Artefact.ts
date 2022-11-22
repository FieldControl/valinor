export interface Artefact {
  id: number;
  title: string;
  description: string;
  thumbnail: { path: string; extension: string };
  modified: string;
}

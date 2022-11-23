import { ISerie } from "./ISerie";

export interface ItemProps {
  data: [
    {
      modified: string;
      description: string;
      name: string;
      fullName: string;
      title: string;
      format: string;
      pageCount: number;
      stories: {
        available: number;
      };
      thumbnail: {
        path: string;
        extension: string;
      };
      comics: {
        available: number;
      };
      events: {
        available: number;
      };
      series: ISerie;
    }
  ];
}

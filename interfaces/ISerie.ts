export interface ISerie {
  available: number;
  data: [
    {
      title: string;
      description: string;
      modified: string;
      startYear: number;
      endYear: number;
      rating: string;
      type: string;
      thumbnail: {
        path: string;
        extension: string;
      };
      creators: {
        available: number;
      };
      characters: {
        available: number;
      };
      stories: {
        available: number;
      };
      comics: {
        available: number;
      };
      events: {
        available: number;
      };
    }
  ];
}

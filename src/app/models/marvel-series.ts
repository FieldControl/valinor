// Créditos a quem merece, feito com auxilio de "https://app.quicktype.io/"

export interface ResultSeries {
    id:          number;
    title:       string;
    description: null | string;
    resourceURI: string;
    startYear:   number;
    endYear:     number;
    type:        string;
    modified:    string;
    thumbnail:   ThumbnailSeries;
    previous:    null;
}

export interface ThumbnailSeries {
    path:      string;
    extension: Extension;
}

export enum Extension {
    Jpg = "jpg",
}
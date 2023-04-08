// Créditos a quem merece, feito com ajuda "https://app.quicktype.io/"

export interface ResultComics {
    id:                 number;
    digitalId:          number;
    title:              string;
    issueNumber:        number;
    variantDescription: string;
    description:        null | string;
    modified:           string;
    isbn:               string;
    upc:                string;
    ean:                string;
    issn:               string;
    pageCount:          number;
    resourceURI:        string;
    collections:        any[];
    thumbnail:          ThumbnailComics;
    images:             ThumbnailComics[];
}

export interface ThumbnailComics {
    path:      string;
    extension: Extension;
}

export enum Extension {
    Jpg = "jpg",
}
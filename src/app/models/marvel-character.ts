// Créditos a quem merece, feito com ajuda "https://app.quicktype.io/"

export interface ResultCharacter {
    id:          number;
    name:        string;
    description: string;
    modified:    string;
    thumbnail:   ThumbnailCharacter;
    resourceURI: string;
    urls:        URL[];
}

export interface ThumbnailCharacter {
    path:      string;
    extension: Extension;
}

export enum Extension {
    GIF = "gif",
    Jpg = "jpg",
}

// Créditos a quem merece, feito com ajuda de "https://app.quicktype.io/"

export interface ResultCreators {
    id:          number;
    firstName:   string;
    middleName:  string;
    lastName:    string;
    suffix:      string;
    fullName:    string;
    modified:    string;
    thumbnail:   ThumbnailCreators;
    resourceURI: string;
}

export interface ThumbnailCreators {
    path:      string;
    extension: Extension;
}

export enum Extension {
    Jpg = "jpg",
}
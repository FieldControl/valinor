// Créditos a quem merece, feito com auxilio "https://app.quicktype.io/"

export interface ResultEvents {
    id:          number;
    title:       string;
    description: string;
    resourceURI: string;
    modified:    string;
    start:       Date | null;
    end:         Date | null;
    thumbnail:   ThumbnailEvents;
}

export interface ThumbnailEvents {
    path:      string;
    extension: Extension;
}

export enum Extension {
    Jpg = "jpg",
}
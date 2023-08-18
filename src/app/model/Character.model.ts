import { Series } from "./Series.model";
import { Stories } from "./Stories.model";

export interface Character {
    id: number,
    name: string,
    description: string,
    series: Series,
    stories: Stories,
    modified: string
}
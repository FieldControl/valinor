import { Card } from "./card";

export interface User {
    _id: string;
    name: string;
    email: string;
    cards: Card[];
    creation: string;
}
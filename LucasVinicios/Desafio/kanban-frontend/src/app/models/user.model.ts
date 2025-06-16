import { Board } from "./board.model";

export interface User {
    id: number
    email: string;
    ownedBoards?: Board[];
    boardsAsMember?: Board[];
}
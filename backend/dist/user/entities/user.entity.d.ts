import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
export declare class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    emailVerified: boolean;
    boards: Board[];
    cards: Card[];
    hashPassword(): Promise<void>;
}

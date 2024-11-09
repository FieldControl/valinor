import { Swimlane } from 'src/swimlane/entities/swimlane.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Card {
    id: number;
    name: string;
    content: string;
    order: number;
    assigneId: number;
    assigne: User;
    swimlaneId: number;
    swimlane: Swimlane;
}

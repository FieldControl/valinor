import { Swimlane } from 'src/swimlane/entities/swimlane.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Board {
    id: number;
    name: string;
    users: User[];
    swimlanes: Swimlane[];
}

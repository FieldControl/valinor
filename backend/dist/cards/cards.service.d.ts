import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';
import { Card } from '@prisma/client';
export declare class CardsService {
    private prisma;
    constructor(prisma: PrismaService);
    createCardForMember(leaderId: number, dto: CreateCardDto): Promise<{
        tasks: {
            id: number;
            description: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            assignedToId: number;
            cardId: number;
        }[];
    } & {
        id: number;
        title: string;
        sentByMember: boolean;
        leaderId: number;
        memberId: number;
    }>;
    findCardsByMemberId(memberId: number): Promise<Card[]>;
    submitCard(cardId: number, userId: number): Promise<{
        id: number;
        title: string;
        sentByMember: boolean;
        leaderId: number;
        memberId: number;
    }>;
}

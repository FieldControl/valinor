import { Injectable } from "@nestjs/common";
import { privateDecrypt } from "crypto";
import { PrismaService } from "./database/prisma.service";

@Injectable()


export class BoardService {

    constructor(private readonly prismaService: PrismaService){
        
    }

    async getBoard(){
        const boards = await this.prismaService.board.findMany()
        return boards
            
        
        
    }
}


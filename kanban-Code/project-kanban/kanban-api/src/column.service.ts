import { Injectable } from "@nestjs/common";
import { privateDecrypt } from "crypto";
import { PrismaService } from "./database/prisma.service";

@Injectable()


export class ColumnService {

    constructor(private readonly prismaService: PrismaService){
        
    }

    async getColumn(){
        const columns = await this.prismaService.column.findMany({
            where:{
                
                boardId:1

                
            }
        })
        
        return columns
        
        
    }
}


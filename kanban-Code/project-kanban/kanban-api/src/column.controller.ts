import { Controller, Get, Post } from "@nestjs/common";
import { ColumnService } from "./column.service";


@Controller("/column")
    

export class ColumnController{
    
    constructor(private readonly columnService: ColumnService) {
        
    }

    @Get()
    async getColumn(){
        const column = await this.columnService.getColumn()
        return column
    }

    
}
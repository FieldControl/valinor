import { Controller, Get } from "@nestjs/common";
import { BoardService } from "./board.service";



@Controller("/board")
    


export class BoardController{
    
    constructor(private readonly boardService: BoardService) {
        
    }

    @Get()
    async getBoard(){
        const board = await this.boardService.getBoard()
        return board
    }

}
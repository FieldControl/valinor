import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { KanbansService } from './kanbans.service';

@Controller('kanbans')
export class KanbansController {

    constructor(private kanbansService : KanbansService){}

    @Post()
    createKanbans(@Body() dados: any) {
        this.kanbansService.createKanbans(dados);
    }

    @Get()
    getKanbans(){
        
        return this.kanbansService.getKanbans()
    }

   
    @Put(':id')
    updateKanban(@Param('id') id: string, @Body() dados : any) {
      return this.kanbansService.updateKanban(id, dados);
    }
}

import { Body, Controller, Post, Get, Patch, Delete, Param } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDTO } from './dto/create-card.dto';
import { UpdateCardDTO } from './dto/update-card.dto';

@Controller('card')
export class CardController {
    constructor(private readonly cardService: CardService) {}

    @Post()
    create(@Body() createCardDTO : CreateCardDTO){
        return this.cardService.create(createCardDTO);
    }

    @Get()
    findAll() {
        return this.cardService.findAll();
    }

    @Patch(':id')
    update(
        @Param('id') id: string, 
        @Body() updateCardDTO : UpdateCardDTO
    ){
        return this.cardService.update(id, updateCardDTO) 
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.cardService.remove(id)
    }

}


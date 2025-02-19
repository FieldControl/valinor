import { ApiProperty } from "@nestjs/swagger";

export class cardDTO {
    id?: number;

    @ApiProperty({example: "Titulo do card", description: "Meta de Estudo"})
    title: string;
    
    @ApiProperty({example: "Descrição do Card", description: "Estudar Angular"})
    description: string

    @ApiProperty({example: "Posição do CARD", description: '1'})
    position: number

    @ApiProperty({example: "Coluna do Kanban", description: "1"})
    columnId: number
}
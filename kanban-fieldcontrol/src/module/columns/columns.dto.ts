import { ApiProperty } from "@nestjs/swagger"

export class columnDTO {
    id?: number

    @ApiProperty({example: "Titulo da Coluna", description: "A Fazer"})
    title: string

    @ApiProperty({example: "Posição da coluna", description: "1"})
    position: number
}
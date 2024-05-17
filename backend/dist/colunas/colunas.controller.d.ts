import { ColunasService } from './colunas.service';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
export declare class ColunasController {
    private readonly colunasService;
    constructor(colunasService: ColunasService);
    create(createColunaDto: CreateColunaDto): Promise<import("./entities/coluna.entity").Coluna>;
    findAll(): Promise<import("./entities/coluna.entity").Coluna[]>;
    findOne(id: string): Promise<import("./entities/coluna.entity").Coluna>;
    update(id: string, updateColunaDto: UpdateColunaDto): Promise<import("./entities/coluna.entity").Coluna>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

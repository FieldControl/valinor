import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { Coluna } from './entities/coluna.entity';
import { Repository } from 'typeorm';
export declare class ColunasService {
    private colunasRepository;
    constructor(colunasRepository: Repository<Coluna>);
    create(CreateColunaDto: CreateColunaDto): Promise<Coluna>;
    findAll(): Promise<Coluna[]>;
    findOne(id: number): Promise<Coluna>;
    update(id: number, updateColunaDto: UpdateColunaDto): Promise<Coluna>;
    remove(id: number): Promise<{
        message: string;
    }>;
}

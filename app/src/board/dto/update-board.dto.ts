import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {} // Os arquivos .dto são usados para definir os objetos de transferência de dados (DTOs) que serão usados nas requisições e respostas da API.

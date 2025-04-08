import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {} // Os arquivos .dto são usados para definir os objetos de transferência de dados (DTOs) que serão usados nas requisições e respostas da API.

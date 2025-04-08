import { PartialType } from '@nestjs/mapped-types';
import { CreateSwimlaneDto } from './create-swimlane.dto';

export class UpdateSwimlaneDto extends PartialType(CreateSwimlaneDto) {} // Os arquivos .dto são usados para definir os objetos de transferência de dados (DTOs) que serão usados nas requisições e respostas da API.

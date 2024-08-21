import { PartialType } from '@nestjs/mapped-types';
import { CriarCartaoDto } from './create-cartao.dto';

export class AtualizarCartaoDto extends PartialType(CriarCartaoDto) {}

import { Cartao } from '../entities/cartao.entity';

export class ReordenarCartaoDto {
  quadroId: number;
  cartoes: Cartao[];
}

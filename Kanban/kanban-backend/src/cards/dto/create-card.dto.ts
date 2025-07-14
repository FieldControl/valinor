export class CreateCardDto {
  title: string;
  description?: string; // O '?' torna o campo opcional
  columnId: number;    //qual coluna o cartão pertence
   badge: 'low' | 'medium' | 'high'; //badged de impotancia do card
}
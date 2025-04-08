export class ReorderedSwimlaneDto { // Os arquivos .dto são usados para definir os objetos de transferência de dados (DTOs) que serão usados nas requisições e respostas da API.
  boardId: number;
  items: ReorderedSwimlaneItemDto[];
}
export class ReorderedSwimlaneItemDto {
  id: number;
  order: number;
}

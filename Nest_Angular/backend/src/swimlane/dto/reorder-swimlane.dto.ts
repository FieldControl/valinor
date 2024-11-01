export class ReorderedSwimlaneDto {
    boardId: number;
    items: ReorderedSwimlaneItemDto[];
}

export class ReorderedSwimlaneItemDto {
    id: number;
    ordem: number;
}

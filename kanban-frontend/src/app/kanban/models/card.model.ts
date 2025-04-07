export interface Card {
    id: number;
    title: string | null;
    description: string | null;
    columnId: number;

    // Propriedades locais, apenas para controle do frontend
    editingTitle?: boolean;
    editingDescription?: boolean;
}
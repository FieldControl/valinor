// Interface para representar uma tarefa no Kanban
export interface Tarefa { 
	id: string;           // ID único da tarefa
	titulo: string;       // Título da tarefa
	descricao?: string;   // Descrição opcional
	ordem: number;        // Posição na coluna
	colunaId?: string;    // ID da coluna onde está
}

// Interface para representar uma coluna no Kanban
export interface Coluna { 
	id: string;           // ID único da coluna
	titulo: string;       // Título da coluna (ex: "A fazer", "Em andamento")
	ordem: number;        // Posição no quadro
	tarefas: Tarefa[];    // Lista de tarefas na coluna
}

// Interface para representar um quadro completo
export interface Quadro { 
	id: string;           // ID único do quadro
	nome: string;         // Nome do quadro
	colunas: Coluna[];    // Lista de colunas no quadro
}
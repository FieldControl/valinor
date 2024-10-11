import { KanbanBoard } from '.';

const toDoColumn = {
  id: 1,
  title: 'Pendente',
  tasks: [
    { id: 4, description: 'Configurar as varias formas' },
    { id: 5, description: 'Como implementar o sistema.' },
    { id: 6, description: 'Mostrar estilos e animacoes.' },
    { id: 7, description: 'Conveter para melhorar.' },
  ],
};

const inProgressColumn = {
  id: 2,
  title: 'Em Proceso',
  tasks: [
    { id: 2, description: 'Mostrar estilos e animacoes.' },
    { id: 3, description: 'Explicar elementos básicos do Drag & Drop.' },
  ],
};

const completedColumn = {
  id: 3,
  title: 'Completo',
  tasks: [
    { id: 1, description: 'Mostrar estilos e animacoes.' },
  ],
};

export const dummyBoard: KanbanBoard = {
  lists: [toDoColumn, inProgressColumn, completedColumn],
};

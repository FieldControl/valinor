export interface Kanban {
  titleProject: string;
  columns: [
    {
      titleColumn: string;
      tasks: [
        {
          titleTask: string;
          description: string;
        },
      ];
    },
  ];
}

export interface Project {
  id: number;
  title: string;
  columns: Array<Column>;
}

export interface Column {
  id: number;
  id_project: number;
  title: string;
  tasks: Array<Task>;
  excluded: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  archived: boolean;
}

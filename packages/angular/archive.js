// LOGICA ANTERIOR, SALVANDO ALGUMAS LINHAS DE RACIOCINIO

/*

  kaban.service. ts


  createNewColumn(columnName: string): void {
    const newColumn = {
      title: columnName,
      tasks: [],
    };
    this.apiService.columnsData.push(newColumn);

    createNewColumn2(id_project: number, title: string): void {
      this.projectsData.forEach((project) => {
        if(project.id == id_project) {
          project.columns.push({
            id: 1,
            id_project: project.id,
            title: title,
            tasks: [],
            excluded: false
          })
        }
      })
    }

    createNewTask(taskTitle: string, taskDescription: string): void {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
      };
      this.apiService.tasksData.push(newTask);
    }

    getProject(id: number) {
      return this.projectsData.find((project) => project.id === id ? project : undefined)
  }

  setCurrentProject(id: number) {
    this.currentProject = []
    let x = this.projectsData.find((project) => project.id == id)
    if(x != undefined) {
      this.currentProject.push(x)
      console.log("Current project mudou")
    }
  }
}

/*

main.ts

  currentProject: Array<Project> = [
    {
      id: 1,
      title: 'New project',
      columns: [],
    },
  ];
  columns: Array<any> = [];
  cards: Array<any> = [];

  constructor(
    private kanbanService: KanbanService,
    private apiService: ApiService,
  ) {}

  getEventCreateColumn(id: number) {
    this.serviceKanban.createNewColumn2(id, 'teste');
    this.projects = this.serviceKanban.projectsData
    this.currentProject = []
    this.currentProject.push(this.serviceKanban.projectsData[0])
  }

  getEventCreateTask() {
    this.serviceKanban.createNewTask('titulo', 'aa');
  }
  */

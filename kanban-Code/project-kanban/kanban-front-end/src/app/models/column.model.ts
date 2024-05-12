export class column {
    public name: string;
    public task: string[];
  
    constructor(name: string, task?: string[]) {
      this.name = name;
      this.task = task || []; 
    }
  }

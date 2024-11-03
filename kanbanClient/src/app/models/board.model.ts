export class BoardModel {
  id: number;
  name: string;
  status: number = 1;
  userId: number;
  constructor() {
    this.id = 0;
    this.name = '';
    this.status = 0;
    this.userId = 0;
  }
}

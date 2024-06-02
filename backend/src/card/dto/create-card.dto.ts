export class CreateCardDto {
  name: string;
  content: string;
  order: number;
  swimlaneId: number;
  date : Date;
  quantUsers : number;
  userName : string;
  color? : string;
}

import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { KanbanStatus } from "src/Entity/kanban.entity";


export class KanbanStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [KanbanStatus.OPEN, KanbanStatus.INPROGRESS, KanbanStatus.COMPLETED];

  transform(value: any, metadata: ArgumentMetadata): any {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} is an invalid status.`);
    }
    return value;
  }

  private isStatusValid(status : any) {
    const index = this.allowedStatus.indexOf(status);

    return index !== -1;
  }

}
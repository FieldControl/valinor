import { PartialType } from "@nestjs/mapped-types";
import { CreateColumnDTO } from "./create-column.dto";

export class UpdateColumnDTO extends PartialType(CreateColumnDTO){}
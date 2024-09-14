import { Icolumn } from "./column.interface";
import { IUser } from "./user.interfaces";

export interface Iboard{
    id: number;
    name: string;
    user?: IUser[];
    column?: Icolumn[];
}

export interface IcreateBoard{
    name: string;
}
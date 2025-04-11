import { Type } from '@nestjs/common';
import { Routes } from '../interfaces/routes.interface';
export declare function flattenRoutePaths(routes: Routes): {
    module: Type;
    path: string;
}[];

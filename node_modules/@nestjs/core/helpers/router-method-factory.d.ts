import { HttpServer } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';
export declare const REQUEST_METHOD_MAP: {
    readonly 0: "get";
    readonly 1: "post";
    readonly 2: "put";
    readonly 3: "delete";
    readonly 4: "patch";
    readonly 5: "all";
    readonly 6: "options";
    readonly 7: "head";
    readonly 8: "search";
    readonly 9: "propfind";
    readonly 10: "proppatch";
    readonly 11: "mkcol";
    readonly 12: "copy";
    readonly 13: "move";
    readonly 14: "lock";
    readonly 15: "unlock";
};
export declare class RouterMethodFactory {
    get(target: HttpServer, requestMethod: RequestMethod): Function;
}

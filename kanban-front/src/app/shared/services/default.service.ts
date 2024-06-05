import { environment } from "../../environments/environment";

export abstract class DefaultService {
    protected url: string;
    protected resource: string = "";

    constructor(resource: string) {
        this.url = `${environment.url}${resource}`
    }
}
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SearchService {

    private search = new Subject<string>();

    search$ = this.search.asObservable();

    addCharacter(character: string) {
        this.search.next(character);
    }

}
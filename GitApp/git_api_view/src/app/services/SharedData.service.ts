import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SharedDateService {

    private dataSubject = new Subject<any>();
    public data$ = this.dataSubject.asObservable();

    _EnviaData(data:any){
        this.dataSubject.next(data)
    }

}
   
    
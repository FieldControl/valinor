import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SharedDateService {

    private dataSubject = new Subject<any>();
    public data$ = this.dataSubject.asObservable();

    _EnviaData(data:any, obj:any = null){
        if(obj != null){
            this.dataSubject.next(this.ConvertData(data,obj))
            return;
        }
        this.dataSubject.next(data)
    }
    private ConvertData(data:any,obj:any){
        
    }
}
   
    
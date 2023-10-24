import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { card } from '../Models/Card';

@Injectable()
export class SharedDateService {
    private search = new Subject<string>();
    public SearchGlobal = this.search.asObservable();
    private dataCardSubject = new Subject<card[]>();
    public dataCard$ = this.dataCardSubject.asObservable();

    setSeach(search:string){
         this.search.next(search)
    }
    SetDataCards(data:any){
         let repositorio = {
            items: new Array()
         };
         
        if(data.items[0].repository != null){
            const item = data.items
           for (let repos = 0; repos < item.length; repos++) {
            repositorio.items.push(item[repos].repository);
           }
           this.dataCardSubject.next(this.convertToData(repositorio))
            
        }else{
            this.dataCardSubject.next(this.convertToData(data))
        }
    }
    convertToData(data:any){
        var cards = new Array<card>;
        data.items.forEach((element:any) => {
           
           const cardMemory = new card(element.owner.avatar_url,
                element.full_name,
                element.description,
                element.topics,
                element.stargazers_count,
                element.updated_at,
                element.language)
            cards.push(cardMemory)
        });
        return cards
    }
}
   
    
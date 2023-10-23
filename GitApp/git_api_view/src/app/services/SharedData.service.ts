import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { card } from '../Models/Card';

@Injectable()
export class SharedDateService {

    private dataCardSubject = new Subject<card[]>();
    public dataCard$ = this.dataCardSubject.asObservable();

    SetDataCards(data:any){
        let cards = this.convertToData(data);
        this.dataCardSubject.next(cards)
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
   
    
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin'; 
import { CreateCardDTO } from './dto/create-card.dto';
import { UpdateCardDTO } from './dto/update-card.dto';
import { Card } from 'src/interface/card.interface'; 

@Injectable()
export class CardService {
    private columnsCollection: admin.firestore.CollectionReference;

    constructor(@Inject('FIRESTORE_DB')private readonly fireStorInstance: admin.firestore.Firestore){
        this.columnsCollection = this.fireStorInstance.collection('columns');
    }

    private getCardsCollectionRef(columnId: string): admin.firestore.CollectionReference{
        return this.columnsCollection.doc(columnId).collection('cards');
    }

    async create(createCardDTO : CreateCardDTO): Promise<Card>{
        const columnRef = this.columnsCollection.doc(createCardDTO.columnId);
        const columnDoc = await columnRef.get()
        if(!columnDoc.exists){
            throw new NotFoundException('Column not found')
        }
        const cardSubCollectionRef = this.getCardsCollectionRef(createCardDTO.columnId);
        const newCardRef = await cardSubCollectionRef.add({
            title: createCardDTO.title,
            description: createCardDTO.description,
            columnId: createCardDTO.columnId,
        });
        return {id: newCardRef.id, ...createCardDTO};
    }

 
    async findAll(): Promise<Card[]>{
        const allCards: Card[] = [];
        const columSnapshot = await this.columnsCollection.get();

        for (const columnDoc of columSnapshot.docs){
            const cardSnapshot = await this.getCardsCollectionRef(columnDoc.id).get();
            cardSnapshot.docs.forEach(cardDoc => {
                allCards.push({id: cardDoc.id, ...cardDoc.data()} as Card);
            });
        }
        return allCards;
    }

  
    async update(id: string, updateCardDTO: UpdateCardDTO): Promise<Card>{
        const {columnId, ...dataToUpdate} = updateCardDTO;

        if(!columnId){
            throw new Error('column not found');
        }

        const cardRef = this.getCardsCollectionRef(columnId).doc(id);
        const cardDoc = await cardRef.get();

        if (!cardDoc.exists){
            throw new Error('card not found');
        }

        await cardRef.update(dataToUpdate);
        return {id, ...cardDoc.data(), ...dataToUpdate} as Card;
    }

    async remove(id: string): Promise<void>{
        let cardToRemove: Card | undefined;
        let columnIdOfCard: string | undefined;

        const columnSnapshot = await this.columnsCollection.get();
       
        for (const columnDoc of columnSnapshot.docs){
            const cardSnapshot = await this.getCardsCollectionRef(columnDoc.id).doc(id).get();
            if (cardSnapshot.exists){
                cardToRemove = {id: cardSnapshot.id, ...cardSnapshot.data() } as Card;
                columnIdOfCard = columnDoc.id;
                break;
            }
        }

        if (!cardToRemove || !columnIdOfCard){
            throw new NotFoundException("Card or column not found");
        }
        await this.getCardsCollectionRef(columnIdOfCard).doc(id).delete();
    }
}
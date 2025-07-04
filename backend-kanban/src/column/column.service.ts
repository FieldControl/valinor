import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDTO } from './dto/create-column.dto';
import { Column } from 'src/interface/column.interface';
import * as admin from 'firebase-admin';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { instanceToPlain } from 'class-transformer';
import { Card } from 'src/interface/card.interface';

@Injectable()
export class ColumnService {
    private columnsCollection: admin.firestore.CollectionReference;

    constructor(@Inject('FIRESTORE_DB')private readonly firestoreInstance: admin.firestore.Firestore){
        this.columnsCollection = this.firestoreInstance.collection('columns');
    }

     async create(createColumnDTO : CreateColumnDTO): Promise<Column>{
         const newColumn = await this.columnsCollection.add({
             title: createColumnDTO.title,
         });
         return {id: newColumn.id, ...createColumnDTO};
     }

    async findAll(): Promise<Column[]>{
            const columnSnapshot = await this.columnsCollection.get();
            const columns: Column[] = [];

            for(const doc of columnSnapshot.docs){
                const columnId = doc.id;
                const columnData = doc.data();

                const cardsSnapshot = await this.columnsCollection.doc(columnId).collection('cards').get();
                const cards: Card[] = cardsSnapshot.docs.map(cardDoc => ({
                    id: cardDoc.id,
                    ...cardDoc.data()
                })) as Card[];

                console.log('Cards raw data:', cards);
                
            }
            return columns;
        }

     async update(id: string, updateColumnDTO: UpdateColumnDTO){
        const columnRef = this.columnsCollection.doc(id);
        const columnDoc = await columnRef.get();

        if (!columnDoc.exists){
            throw new NotFoundException('column not found')
        }

        const dataToUpdate = instanceToPlain(updateColumnDTO);
        await columnRef.update(dataToUpdate);

        const updatedData = {...columnDoc.data(), ...updateColumnDTO}
        return {id:columnDoc.id, ...updatedData} as Column;
     }

     async remove(id: string): Promise<void>{
        
         const columnRef = await this.columnsCollection.doc(id);
         const columnDoc = await columnRef.get();

          if (!columnDoc.exists) { 
            throw new NotFoundException(`Column not found.`);
        }

        const cardsSnapshot = await columnRef.collection('cards').get()
        const batch = this.firestoreInstance.batch();

        cardsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        await columnRef.delete();    
     }
}

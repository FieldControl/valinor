import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateColumnDTO } from './dto/create-column.dto';
import { Column } from 'src/interface/column.interface';
import * as admin from 'firebase-admin';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ColumnService {
    private firestore: admin.firestore.Firestore;
    private columnsCollection: admin.firestore.CollectionReference;

    constructor(private readonly firebaseService: FirebaseService){
        this.firestore = this.firebaseService.firestore;
        this.columnsCollection = this.firebaseService.firestore.collection('columns');
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
            columnSnapshot.docs.forEach(doc => {
                columns.push({ id: doc.id, ...doc.data()} as Column);
            });
            return columns
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
        const batch = this.firestore.batch();

        cardsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        await columnRef.delete();    
     }
}

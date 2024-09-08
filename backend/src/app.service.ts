import { Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { firestore } from './firebase-config' // Configuração do Firebase

@Injectable()
export class AppService {
  private db = firestore;

  async create(createColumnDto: CreateColumnDto) {
    const docRef = await this.db.collection('columns').add(createColumnDto);
    createColumnDto.id = docRef.id;
    await this.update(docRef.id,createColumnDto)
    return createColumnDto; 
  }

  async findAll() {
    const docRef = await this.db.collection('columns').get();
    return docRef.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    return await this.db.collection('columns').doc(id).update(updateColumnDto);
  }

  async remove(id: string) {
    return await this.db.collection('columns').doc(id).delete();
  }
}

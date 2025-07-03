import { Inject, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService{
    private readonly logger = new Logger(FirebaseService.name)

    constructor(@Inject('FIRESTORE_DB') private readonly firestoreInstance: admin.firestore.Firestore) {
        this.logger.log('FirebaseService star, and firestore injected')
    }

    getFirestore(): admin.firestore.Firestore{
        return this.firestoreInstance;
    }

}

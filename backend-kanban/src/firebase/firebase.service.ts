import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit{
    private readonly logger = new Logger(FirebaseService.name)
    public firestore: admin.firestore.Firestore;

    onModuleInit() {
        if (!admin.apps.length){
            try{
                const ServiceAccountPath = path.resolve(__dirname, '../../kanban-9eb1f-firebase-adminsdk-fbsvc-c9c5f73457.json');
                const ServiceAccount = require(ServiceAccountPath);
                admin.initializeApp({
                    credential: admin.credential.cert(ServiceAccount),
                });
                this.logger.log('FirebaseStarted')
            }catch (error){
                this.logger.error('FirebaseErrorNotStarted', error.message)
                throw new InternalServerErrorException('ErrorConfigurationFirebase')
            }
        }
        this.firestore = admin.firestore();
    }
}

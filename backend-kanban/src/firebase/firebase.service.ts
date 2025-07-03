import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit{
    private readonly logger = new Logger(FirebaseService.name)
    public firestore: admin.firestore.Firestore;

    constructor(private configService: ConfigService) {}


    onModuleInit() {
        if (!admin.apps.length){
            try{
                const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');

                if (!serviceAccountJson) {
                    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. Cannot initialize Firebase Admin SDK.');
                }
                const serviceAccount = JSON.parse(serviceAccountJson);
                
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
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

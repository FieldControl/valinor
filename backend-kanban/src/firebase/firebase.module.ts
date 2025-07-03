import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin'; 

@Global()
@Module({
  imports:[ConfigModule],
  providers: [FirebaseService, 
    {
      provide: 'FIREBASE_APP',
      useFactory: (configService: ConfigService) =>{
        const serviceAccountJson = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
        if (!serviceAccountJson){
          throw new Error('CANNOT START THE FIREBASE')
        }
        const serviceAccount = JSON.parse(serviceAccountJson);
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('Firebase Admin SDK started by FirebaseModule'); 
        } else {
          console.log('Firebase Admin SDK started'); 
        }
        return admin.app();
    },
    inject: [ConfigService],
  },
  {
    provide: 'FIRESTORE_DB',
    useFactory: (app: admin.app.App) => app.firestore(),
    inject: ['FIREBASE_APP']
  }
],
  exports: [FirebaseService, 'FIRESTORE_DB','FIREBASE_APP']
})
export class FirebaseModule {}

import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// Exporta as instâncias do Firestore e Storage
export const db = admin.firestore();
export const storage = admin.storage();

// Exporta o auth para autenticação
export const auth = admin.auth();

// Exporta funções auxiliares para autenticação
export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Middleware para verificar autenticação
export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      throw new Error('Token não fornecido');
    }
    const decodedToken = await verifyToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Não autorizado' });
  }
}; 
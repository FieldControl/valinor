import { DecodedIdToken } from 'firebase-admin/auth';

export interface Context {
  user?: DecodedIdToken;
} 
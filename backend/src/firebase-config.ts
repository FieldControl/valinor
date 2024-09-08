import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyBIqjnIgMuAy7dnsXeQ8G2k1f8GYszmhII",
  authDomain: "kanban-10c71.firebaseapp.com",
  projectId: "kanban-10c71",
  storageBucket: "kanban-10c71.appspot.com",
  messagingSenderId: "540824789311",
  appId: "web:bdbc2bf6dc4dd0044ab38a",
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();

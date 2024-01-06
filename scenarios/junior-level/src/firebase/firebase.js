import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDt5aZqJhG2ygOhhW8jhq9nRw1ZgRdYJiQ',
  authDomain: 'react-next-shop-app-751d3.firebaseapp.com',
  projectId: 'react-next-shop-app-751d3',
  storageBucket: 'react-next-shop-app-751d3.appspot.com',
  messagingSenderId: '636201975370',
  appId: '1:636201975370:web:6a4d3a36102fe7eedeb0b3',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

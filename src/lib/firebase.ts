
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "receipt-wrangler-4q07g",
  "appId": "1:589173998186:web:a2e8d6fedfa0c208be0013",
  "storageBucket": "receipt-wrangler-4q07g.firebasestorage.app",
  "apiKey": "AIzaSyA9BVVaaGGsRAFsAvOnHHIN37DbtVdMguk",
  "authDomain": "receipt-wrangler-4q07g.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "589173998186"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

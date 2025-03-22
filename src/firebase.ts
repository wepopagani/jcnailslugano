import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Copia qui le tue credenziali dalla console Firebase
  // Trovi questi valori in: Impostazioni progetto > Generale > Configurazione SDK
  apiKey: "AIzaSyA5u7yXGq0RwU2TvgXCdsKIrgizWKs8NDo",
  authDomain: "jcnailslugano.firebaseapp.com",
  projectId: "jcnailslugano",
  storageBucket: "jcnailslugano.appspot.com",
  messagingSenderId: "405077381695",
  appId: "1:405077381695:web:9f658e087780936c411e8a",
  measurementId: "G-ZMGYFP8Q4P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 
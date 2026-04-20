/* --- firebase/config.js --- */
/* Inicialização do Firebase — Carregar ANTES de qualquer outro módulo Firebase */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBGORYD-qYb-_nlOcvRdtr4Ik7AU3vL2TQ",
    authDomain: "ordem-1e087.firebaseapp.com",
    databaseURL: "https://ordem-1e087-default-rtdb.firebaseio.com",
    projectId: "ordem-1e087",
    storageBucket: "ordem-1e087.firebasestorage.app",
    messagingSenderId: "88210368221",
    appId: "1:88210368221:web:cd5132ea664fe169d95d34"
};

const DB_BASE = 'ordem';

// Inicializa Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const firebaseDb = firebase.database();
const firebaseAuth = firebase.auth();

// Helper: referência base do Ordem
function dbRef(path) {
    return firebaseDb.ref(DB_BASE + '/' + path);
}

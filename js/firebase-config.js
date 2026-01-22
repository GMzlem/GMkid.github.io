// ========================================
// Firebase Configuration
// ========================================

// Firebase SDK import
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAO5bbK1A7y0qJdBgdscUZZ4jn84Dh6W_4",
    authDomain: "yeshua-love.firebaseapp.com",
    projectId: "yeshua-love",
    storageBucket: "yeshua-love.firebasestorage.app",
    messagingSenderId: "53318867442",
    appId: "1:53318867442:web:9e52a2c5965543fcb0b36b",
    measurementId: "G-D6YNXTE7PZ"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

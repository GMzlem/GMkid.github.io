// ========================================
// Authentication Management
// ========================================

import { auth } from './firebase-config.js';
import { db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js';
import {
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

// ========================================
// Admin Check (Firestore)
// ========================================
// 관리자 UID는 코드에 없음!
// Firestore의 'admins' 컬렉션에서 확인합니다.

export async function isAdmin(user) {
    if (!user) return false;
    
    try {
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (adminDoc.exists()) {
            const data = adminDoc.data();
            return data.isAdmin === true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// 로그인
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// 회원가입
export async function signup(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = '회원가입에 실패했습니다.';
        
        // Firebase error codes
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = '이미 사용 중인 이메일입니다.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Google 로그인
export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
        await signInWithRedirect(auth, provider);
        return { success: false, redirecting: true };
    } catch (error) {
        console.error('Google login error:', error);
        let errorMessage = 'Google 로그인에 실패했습니다.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = '로그인 창이 닫혔습니다.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = '팝업이 차단되었습니다. 리다이렉트 로그인을 다시 시도해주세요.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = '로그인이 취소되었습니다.';
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function completeGoogleRedirectLogin() {
    try {
        const result = await getRedirectResult(auth);
        if (!result) {
            return { success: false, noResult: true };
        }
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google redirect login error:', error);
        return {
            success: false,
            error: 'Google 로그인 처리 중 오류가 발생했습니다: ' + error.message
        };
    }
}

// 로그아웃
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// 인증 상태 감지
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        const adminStatus = await isAdmin(user);
        callback(user, adminStatus);
    });
}

export function onUserChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// 현재 사용자 가져오기
export function getCurrentUser() {
    return auth.currentUser;
}

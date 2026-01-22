// ========================================
// Auth UI Management for Main Page
// ========================================

import { onAuthChange, logout } from './auth.js';

// DOM Elements
const headerLoginBtn = document.getElementById('headerLoginBtn');
const mobileLoginBtn = document.getElementById('mobileLoginBtn');

let currentUser = null;
let isUserAdmin = false;

// ========================================
// Initialize Auth State
// ========================================
onAuthChange((user, admin) => {
    currentUser = user;
    isUserAdmin = admin;
    updateAuthUI();
});

// ========================================
// Update Auth UI
// ========================================
function updateAuthUI() {
    if (currentUser) {
        // User is logged in
        updateHeaderAuthUI();
        updateMobileAuthUI();
    } else {
        // User is not logged in
        resetAuthUI();
    }
}

// ========================================
// Header Auth UI (Desktop)
// ========================================
function updateHeaderAuthUI() {
    const headerAuth = document.querySelector('.header-auth');
    
    // Get user display name (email without @domain)
    const displayName = getUserDisplayName(currentUser.email);
    
    headerAuth.innerHTML = `
        <div class="header-user-info">
            <span class="header-user-name">${displayName}님</span>
            ${isUserAdmin ? '<span style="color: #d4af37; font-size: 0.75rem;">관리자</span>' : ''}
            <button class="header-logout-btn" id="headerLogoutBtn">로그아웃</button>
        </div>
    `;
    
    // Add logout event listener
    const logoutBtn = document.getElementById('headerLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// ========================================
// Mobile Auth UI
// ========================================
function updateMobileAuthUI() {
    const displayName = getUserDisplayName(currentUser.email);
    
    const mobileLoginItem = document.querySelector('.mobile-login-item');
    mobileLoginItem.innerHTML = `
        <div style="padding: 15px 20px; color: white; border-radius: 10px; margin: 0 20px; background: linear-gradient(135deg, #2c5aa0 0%, #1e4a7a 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 3px;">${displayName}님</div>
                    ${isUserAdmin ? '<div style="font-size: 0.8rem; color: #d4af37;">관리자</div>' : ''}
                </div>
                <button id="mobileLogoutBtn" style="padding: 6px 12px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 15px; color: white; cursor: pointer;">로그아웃</button>
            </div>
        </div>
    `;
    
    // Add logout event listener
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }
}

// ========================================
// Reset Auth UI (Not Logged In)
// ========================================
function resetAuthUI() {
    // Reset header
    const headerAuth = document.querySelector('.header-auth');
    headerAuth.innerHTML = `
        <button class="header-login-btn" id="headerLoginBtn">로그인</button>
    `;
    
    // Add login event listener
    const newHeaderLoginBtn = document.getElementById('headerLoginBtn');
    if (newHeaderLoginBtn) {
        newHeaderLoginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    // Reset mobile menu
    const mobileLoginItem = document.querySelector('.mobile-login-item');
    mobileLoginItem.innerHTML = `
        <a href="login.html" id="mobileLoginBtn" class="mobile-login-link">로그인</a>
    `;
}

// ========================================
// Handle Logout
// ========================================
async function handleLogout() {
    if (confirm('로그아웃하시겠습니까?')) {
        const result = await logout();
        if (result.success) {
            alert('로그아웃되었습니다.');
            window.location.reload();
        }
    }
}

// ========================================
// Get User Display Name
// ========================================
function getUserDisplayName(email) {
    if (!email) return '사용자';
    
    // Extract name from email (before @)
    const name = email.split('@')[0];
    
    // If name is too long, truncate
    if (name.length > 10) {
        return name.substring(0, 10) + '...';
    }
    
    return name;
}

// ========================================
// Initial Setup
// ========================================
if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'login.html';
    });
}

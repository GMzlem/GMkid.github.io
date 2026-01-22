// ========================================
// Sermon Page JavaScript with Firebase
// ========================================

import { db } from './firebase-config.js';
import { onAuthChange, isAdmin, getCurrentUser } from './auth.js';
import { 
    collection, 
    query, 
    orderBy, 
    getDocs,
    deleteDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

(function() {
    'use strict';

    // DOM Elements
    const serviceButtons = document.querySelectorAll('.service-btn');
    const datePanel = document.getElementById('datePanel');
    const datePanelTitle = document.getElementById('datePanelTitle');
    const dateList = document.getElementById('dateList');
    const closePanel = document.getElementById('closePanel');
    const panelOverlay = document.getElementById('panelOverlay');
    const welcomeState = document.getElementById('welcomeState');
    const contentPaper = document.getElementById('contentPaper');
    const contentTitle = document.getElementById('contentTitle');
    const contentMeta = document.getElementById('contentMeta');
    const contentBody = document.getElementById('contentBody');
    const pagination = document.getElementById('pagination');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    // Mobile Menu Elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    // Auth Elements
    const authButton = document.getElementById('authButton');
    const adminButton = document.getElementById('adminButton');

    // State
    let currentService = null;
    let currentDate = null;
    let currentPage = 0;
    let currentContent = null;
    let currentUser = null;
    let isUserAdmin = false;

    // Sermon Data (will be loaded from Firebase)
    let sermonData = {
        'sunday-morning': [],
        'sunday-afternoon': [],
        'wednesday': [],
        'friday': [],
        'sunday-school': []
    };
    let sermonsLoaded = false;  // 로드 여부 플래그

    // ========================================
    // Authentication State
    // ========================================
    onAuthChange((user, admin) => {
        currentUser = user;
        isUserAdmin = admin;
        updateAuthUI();
    });

    // ========================================
    // Load ALL Sermons on Page Load (Once)
    // ========================================
    async function loadAllSermons() {
        if (sermonsLoaded) {
            console.log('이미 로드됨 - 스킵');
            return;
        }
        
        console.log('설교 데이터 로드 시작...');
        
        try {
            const sermonsRef = collection(db, 'sermons');
            const q = query(sermonsRef, orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            
            console.log('Firestore에서 가져온 문서 수:', querySnapshot.size);
            
            // Clear all arrays
            Object.keys(sermonData).forEach(key => {
                sermonData[key] = [];
            });
            
            // Group sermons by service type
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const serviceType = data.service;
                
                console.log('문서 처리:', docSnap.id, '타입:', serviceType);
                
                if (sermonData[serviceType]) {
                    sermonData[serviceType].push({
                        id: docSnap.id,
                        date: data.date,
                        title: data.title,
                        content: data.content || [],
                        service: data.service
                    });
                } else {
                    console.warn('알 수 없는 서비스 타입:', serviceType);
                }
            });
            
            sermonsLoaded = true;
            console.log('✅ 모든 설교 로드 완료!');
            console.log('📊 데이터:', sermonData);
        } catch (error) {
            console.error('❌ 설교 로드 실패:', error);
            alert('설교를 불러오는데 실패했습니다. Firebase 설정을 확인해주세요.');
        }
    }

    // 페이지 로드 시 모든 설교 미리 로드
    console.log('페이지 로드 - 설교 데이터 로드 시작');
    loadAllSermons();

    function updateAuthUI() {
        if (currentUser) {
            if (authButton) {
                authButton.textContent = '로그아웃';
                authButton.onclick = handleLogout;
            }
            if (adminButton && isUserAdmin) {
                adminButton.style.display = 'block';
            } else if (adminButton) {
                adminButton.style.display = 'none';
            }
        } else {
            if (authButton) {
                authButton.textContent = '로그인';
                authButton.onclick = handleLogin;
            }
            if (adminButton) {
                adminButton.style.display = 'none';
            }
        }
    }

    function handleLogin() {
        window.location.href = 'login.html';
    }

    async function handleLogout() {
        const { logout } = await import('./auth.js');
        const result = await logout();
        if (result.success) {
            alert('로그아웃되었습니다.');
        }
    }

    // ========================================
    // Mobile Menu Functions
    // ========================================
    function openMobileMenu() {
        if (sidebar) sidebar.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (sidebar) sidebar.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mobile Menu Event Listeners
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            if (sidebar && sidebar.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // ========================================
    // Service Button Click
    // ========================================
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const service = this.getAttribute('data-service');
            currentService = service;
            
            console.log('🔘 버튼 클릭:', service);

            // Update active state
            serviceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 데이터가 로드되지 않았으면 로드
            if (!sermonsLoaded) {
                console.log('⏳ 데이터 로딩 중...');
                await loadAllSermons();
            } else {
                console.log('✅ 캐시된 데이터 사용');
            }
            
            console.log(`📋 ${service} 설교 개수:`, sermonData[service].length);

            // Open date panel (캐시된 데이터 사용)
            openDatePanel(service);
        });
    });

    // ========================================
    // Date Panel Functions
    // ========================================
    function openDatePanel(service) {
        console.log('📅 openDatePanel 호출:', service);
        
        const serviceName = getServiceName(service);
        datePanelTitle.textContent = serviceName + ' 날짜 선택';

        // Populate dates
        const dates = sermonData[service] || [];
        console.log('📋 날짜 목록:', dates);
        
        dateList.innerHTML = '';

        if (dates.length === 0) {
            console.log('⚠️ 설교 없음');
            dateList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">등록된 설교가 없습니다.</p>';
        } else {
            console.log(`✅ ${dates.length}개 설교 표시`);
            dates.forEach((sermon, index) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                
                let itemHTML = `
                    <div class="date-item-date">${sermon.date}</div>
                    <div class="date-item-title">${sermon.title}</div>
                `;

                // Add delete button for admin
                if (isUserAdmin) {
                    itemHTML += `
                        <button class="delete-sermon-btn" data-sermon-id="${sermon.id}" data-index="${index}">
                            삭제
                        </button>
                    `;
                }

                dateItem.innerHTML = itemHTML;
                
                // Click on date item (not delete button)
                dateItem.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('delete-sermon-btn')) {
                        selectDate(service, index);
                    }
                });

                // Delete button event
                if (isUserAdmin) {
                    const deleteBtn = dateItem.querySelector('.delete-sermon-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', async function(e) {
                            e.stopPropagation();
                            if (confirm('정말로 이 설교를 삭제하시겠습니까?')) {
                                await deleteSermon(sermon.id, service, index);
                            }
                        });
                    }
                }

                dateList.appendChild(dateItem);
            });
        }

        // Show panel
        console.log('🎬 패널 열기 시도...');
        console.log('datePanel:', datePanel);
        console.log('panelOverlay:', panelOverlay);
        
        datePanel.classList.add('active');
        panelOverlay.classList.add('active');
        
        console.log('✅ 패널 클래스 추가 완료');
        console.log('datePanel has active:', datePanel.classList.contains('active'));
    }

    async function deleteSermon(sermonId, service, index) {
        try {
            await deleteDoc(doc(db, 'sermons', sermonId));
            alert('설교가 삭제되었습니다.');
            
            // Remove from local data
            sermonData[service].splice(index, 1);
            
            // Refresh panel
            openDatePanel(service);
        } catch (error) {
            console.error('Error deleting sermon:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }

    function closeDatePanel() {
        datePanel.classList.remove('active');
        panelOverlay.classList.remove('active');
    }

    closePanel.addEventListener('click', closeDatePanel);
    panelOverlay.addEventListener('click', closeDatePanel);

    // ========================================
    // Date Selection
    // ========================================
    function selectDate(service, index) {
        const sermon = sermonData[service][index];
        currentDate = sermon.date;
        currentContent = sermon;
        currentPage = 0;

        // Update active date
        const dateItems = dateList.querySelectorAll('.date-item');
        dateItems.forEach(item => item.classList.remove('active'));
        dateItems[index].classList.add('active');

        // Show content
        displayContent();

        // Close panels after selection
        setTimeout(closeDatePanel, 300);
        setTimeout(closeMobileMenu, 300);
    }

    // ========================================
    // Display Content
    // ========================================
    function displayContent() {
        if (!currentContent) return;

        // Hide welcome, show paper
        welcomeState.style.display = 'none';
        contentPaper.style.display = 'block';

        // Set title and meta
        contentTitle.textContent = currentContent.title;
        contentMeta.textContent = `${currentContent.date} | ${getServiceName(currentService)}`;

        // Set body content
        const pages = currentContent.content;
        contentBody.innerHTML = pages[currentPage];

        // Update pagination
        if (pages.length > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = `${currentPage + 1} / ${pages.length}`;
            prevPage.disabled = currentPage === 0;
            nextPage.disabled = currentPage === pages.length - 1;
        } else {
            pagination.style.display = 'none';
        }

        // Scroll to top
        contentPaper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ========================================
    // Pagination
    // ========================================
    prevPage.addEventListener('click', function() {
        if (currentPage > 0) {
            currentPage--;
            displayContent();
        }
    });

    nextPage.addEventListener('click', function() {
        if (currentContent && currentPage < currentContent.content.length - 1) {
            currentPage++;
            displayContent();
        }
    });

    // ========================================
    // Helper Functions
    // ========================================
    function getServiceName(service) {
        const names = {
            'sunday-morning': '주일오전예배',
            'sunday-afternoon': '주일오후예배',
            'wednesday': '수요예배',
            'friday': '금요예배',
            'sunday-school': '주일학교'
        };
        return names[service] || '';
    }

    // ========================================
    // Keyboard Navigation
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Close panel on ESC
        if (e.key === 'Escape' && datePanel.classList.contains('active')) {
            closeDatePanel();
        }

        // Navigate pages with arrow keys
        if (contentPaper.style.display !== 'none') {
            if (e.key === 'ArrowLeft' && !prevPage.disabled) {
                prevPage.click();
            } else if (e.key === 'ArrowRight' && !nextPage.disabled) {
                nextPage.click();
            }
        }
    });

})();

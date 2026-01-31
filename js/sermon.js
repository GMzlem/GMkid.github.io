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
    updateDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

(function() {
    'use strict';

    // DOM Elements
    const serviceButtons = document.querySelectorAll('.service-btn');
    const bibleViewBtn = document.getElementById('bibleViewBtn');
    const datePanel = document.getElementById('datePanel');
    const datePanelTitle = document.getElementById('datePanelTitle');
    const dateList = document.getElementById('dateList');
    const closePanel = document.getElementById('closePanel');
    const biblePanel = document.getElementById('biblePanel');
    const closeBiblePanel = document.getElementById('closeBiblePanel');
    const oldTestamentBtn = document.getElementById('oldTestamentBtn');
    const newTestamentBtn = document.getElementById('newTestamentBtn');
    const oldTestamentBooks = document.getElementById('oldTestamentBooks');
    const newTestamentBooks = document.getElementById('newTestamentBooks');
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

    // Edit Modal Elements
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const editDate = document.getElementById('editDate');
    const editService = document.getElementById('editService');
    const editTitle = document.getElementById('editTitle');
    const editCategory = document.getElementById('editCategory');
    const editPagesContainer = document.getElementById('editPagesContainer');
    const addPageBtn = document.getElementById('addPageBtn');

    // State
    let currentService = null;
    let currentDate = null;
    let currentPage = 0;
    let currentContent = null;
    let currentUser = null;
    let isUserAdmin = false;
    let editingSermon = null; // 현재 수정 중인 설교

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
            const q = query(sermonsRef, orderBy('date', 'desc'));
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
                
                console.log('문서 처리:', docSnap.id, '타입:', serviceType, '날짜:', data.date);
                
                if (sermonData[serviceType]) {
                    sermonData[serviceType].push({
                        id: docSnap.id,
                        date: data.date,
                        title: data.title,
                        content: data.content || [],
                        service: data.service,
                        category: data.category || ''
                    });
                } else {
                    console.warn('알 수 없는 서비스 타입:', serviceType);
                }
            });
            
            // Sort each service by date (most recent first)
            Object.keys(sermonData).forEach(key => {
                sermonData[key].sort((a, b) => {
                    // Parse dates and compare (descending order)
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });
            });
            
            sermonsLoaded = true;
            console.log('모든 설교 로드 완료!');
            console.log('데이터:', sermonData);
        } catch (error) {
            console.error('설교 로드 실패:', error);
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
            
            console.log('버튼 클릭:', service);

            // Update active state
            serviceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 데이터가 로드되지 않았으면 로드
            if (!sermonsLoaded) {
                console.log('데이터 로딩 중...');
                await loadAllSermons();
            } else {
                console.log('캐시된 데이터 사용');
            }
            
            console.log(`${service} 설교 개수:`, sermonData[service].length);

            // Open date panel (캐시된 데이터 사용)
            openDatePanel(service);
        });
    });

    // ========================================
    // Date Panel Functions
    // ========================================
    function openDatePanel(service) {
        console.log('openDatePanel 호출:', service);
        
        const serviceName = getServiceName(service);
        datePanelTitle.textContent = serviceName + ' 날짜 선택';

        // Populate dates
        const dates = sermonData[service] || [];
        console.log('날짜 목록:', dates);
        
        dateList.innerHTML = '';

        if (dates.length === 0) {
            console.log('설교 없음');
            dateList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">등록된 설교가 없습니다.</p>';
        } else {
            console.log(`${dates.length}개 설교 표시`);
            dates.forEach((sermon, index) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                
                let itemHTML = `
                    <div class="date-item-date">${sermon.date}</div>
                    <div class="date-item-title">${sermon.title}</div>
                `;

                // Add edit and delete buttons for admin
                if (isUserAdmin) {
                    itemHTML += `
                        <button class="edit-sermon-btn" data-sermon-id="${sermon.id}" data-index="${index}">
                            수정
                        </button>
                        <button class="delete-sermon-btn" data-sermon-id="${sermon.id}" data-index="${index}">
                            삭제
                        </button>
                    `;
                }

                dateItem.innerHTML = itemHTML;
                
                // Click on date item (not edit/delete button)
                dateItem.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('delete-sermon-btn') && 
                        !e.target.classList.contains('edit-sermon-btn')) {
                        selectDate(service, index);
                    }
                });

                // Edit button event
                if (isUserAdmin) {
                    const editBtn = dateItem.querySelector('.edit-sermon-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            openEditModal(sermon, service, index);
                        });
                    }
                }

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
        console.log('패널 열기 시도...');
        console.log('datePanel:', datePanel);
        console.log('panelOverlay:', panelOverlay);
        
        datePanel.classList.add('active');
        panelOverlay.classList.add('active');
        
        console.log('패널 클래스 추가 완료');
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
    // Bible Panel Functions
    // ========================================
    function openBiblePanel() {
        // Close date panel if open
        closeDatePanel();
        
        biblePanel.classList.add('active');
        panelOverlay.classList.add('active');
    }

    function displaySermonsByCategory(category) {
        // Collect all sermons with matching category
        const filteredSermons = [];
        Object.keys(sermonData).forEach(service => {
            sermonData[service].forEach(sermon => {
                if (sermon.category === category) {
                    filteredSermons.push({
                        ...sermon,
                        serviceName: getServiceName(service)
                    });
                }
            });
        });

        // Sort by date (most recent first)
        filteredSermons.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });

        // Display in a separate container
        const bibleList = document.getElementById('bibleList');
        
        // Create a container for the sermon list
        const sermonListContainer = document.createElement('div');
        sermonListContainer.className = 'sermon-list-container';
        sermonListContainer.id = 'sermonListContainer';
        
        // Add back button
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-books-btn';
        backBtn.innerHTML = '목록으로';
        backBtn.addEventListener('click', showBookList);
        sermonListContainer.appendChild(backBtn);

        // Add category title
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category;
        sermonListContainer.appendChild(categoryTitle);

        if (filteredSermons.length === 0) {
            const noSermons = document.createElement('p');
            noSermons.style.padding = '20px';
            noSermons.style.textAlign = 'center';
            noSermons.style.color = '#999';
            noSermons.textContent = '이 분류에 등록된 설교가 없습니다.';
            sermonListContainer.appendChild(noSermons);
        } else {
            filteredSermons.forEach((sermon, index) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                
                let itemHTML = `
                    <div class="date-item-date">${sermon.date}</div>
                    <div class="date-item-service">${sermon.serviceName}</div>
                    <div class="date-item-title">${sermon.title}</div>
                `;

                // Add edit and delete buttons for admin
                if (isUserAdmin) {
                    itemHTML += `
                        <button class="edit-sermon-btn" data-sermon-id="${sermon.id}" data-index="${index}">
                            수정
                        </button>
                        <button class="delete-sermon-btn" data-sermon-id="${sermon.id}" data-index="${index}">
                            삭제
                        </button>
                    `;
                }

                dateItem.innerHTML = itemHTML;
                
                // Click on date item
                dateItem.addEventListener('click', function(e) {
                    if (!e.target.classList.contains('delete-sermon-btn') && 
                        !e.target.classList.contains('edit-sermon-btn')) {
                        selectSermonFromCategory(sermon);
                    }
                });

                // Edit button event
                if (isUserAdmin) {
                    const editBtn = dateItem.querySelector('.edit-sermon-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const serviceArray = sermonData[sermon.service];
                            const actualIndex = serviceArray.findIndex(s => s.id === sermon.id);
                            openEditModal(sermon, sermon.service, actualIndex);
                        });
                    }
                }

                // Delete button event
                if (isUserAdmin) {
                    const deleteBtn = dateItem.querySelector('.delete-sermon-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', async function(e) {
                            e.stopPropagation();
                            if (confirm('정말로 이 설교를 삭제하시겠습니까?')) {
                                const serviceArray = sermonData[sermon.service];
                                const actualIndex = serviceArray.findIndex(s => s.id === sermon.id);
                                await deleteSermon(sermon.id, sermon.service, actualIndex);
                                // Refresh category view
                                displaySermonsByCategory(category);
                            }
                        });
                    }
                }

                sermonListContainer.appendChild(dateItem);
            });
        }

        // Hide book list and show sermon list
        bibleList.style.display = 'none';
        biblePanel.querySelector('.bible-panel-header').insertAdjacentElement('afterend', sermonListContainer);
    }

    function showBookList() {
        const sermonListContainer = document.getElementById('sermonListContainer');
        if (sermonListContainer) {
            sermonListContainer.remove();
        }
        const bibleList = document.getElementById('bibleList');
        bibleList.style.display = 'block';
    }

    function selectSermonFromCategory(sermon) {
        currentDate = sermon.date;
        currentContent = sermon;
        currentService = sermon.service;
        currentPage = 0;

        // Show content
        displayContent();

        // Close panels after selection
        setTimeout(closeBiblePanelFunc, 300);
        setTimeout(closeMobileMenu, 300);
    }

    function closeBiblePanelFunc() {
        biblePanel.classList.remove('active');
        panelOverlay.classList.remove('active');
        // Reset to book list view
        showBookList();
    }

    // Bible View Button Click
    if (bibleViewBtn) {
        bibleViewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openBiblePanel();
        });
    }

    // Close Bible Panel
    if (closeBiblePanel) {
        closeBiblePanel.addEventListener('click', closeBiblePanelFunc);
    }

    // Testament Accordion Toggle
    if (oldTestamentBtn) {
        oldTestamentBtn.addEventListener('click', function() {
            const isOpen = oldTestamentBooks.style.display === 'block';
            oldTestamentBooks.style.display = isOpen ? 'none' : 'block';
            this.classList.toggle('active', !isOpen);
        });
    }

    if (newTestamentBtn) {
        newTestamentBtn.addEventListener('click', function() {
            const isOpen = newTestamentBooks.style.display === 'block';
            newTestamentBooks.style.display = isOpen ? 'none' : 'block';
            this.classList.toggle('active', !isOpen);
        });
    }

    // Book Button Click
    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const bookName = this.getAttribute('data-book');
            displaySermonsByCategory(bookName);
        });
    });

    // Update panelOverlay click to close both panels
    panelOverlay.addEventListener('click', function() {
        closeDatePanel();
        closeBiblePanelFunc();
    });

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
    // Edit Modal Functions
    // ========================================
    function openEditModal(sermon, service, index) {
        editingSermon = { ...sermon, service, index };
        
        // Populate form
        editDate.value = sermon.date;
        editService.value = service;
        editTitle.value = sermon.title;
        editCategory.value = sermon.category || '';
        
        // Populate pages
        editPagesContainer.innerHTML = '';
        sermon.content.forEach((pageContent, pageIndex) => {
            addPageToEditor(pageContent, pageIndex);
        });
        
        // Show modal
        editModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEditModalHandler() {
        editModal.classList.remove('active');
        document.body.style.overflow = '';
        editingSermon = null;
    }

    function addPageToEditor(content = '', pageIndex = null) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-editor';
        
        const actualIndex = pageIndex !== null ? pageIndex : editPagesContainer.children.length;
        const editorId = `editor-${Date.now()}-${actualIndex}`;
        
        pageDiv.innerHTML = `
            <div class="page-editor-header">
                <span class="page-number">페이지 ${actualIndex + 1}</span>
                <button type="button" class="remove-page-btn" onclick="this.closest('.page-editor').remove(); updatePageNumbers();">삭제</button>
            </div>
            <div id="${editorId}" class="quill-editor"></div>
        `;
        
        editPagesContainer.appendChild(pageDiv);
        
        // Initialize Quill editor
        const quill = new Quill(`#${editorId}`, {
            theme: 'snow',
            placeholder: '페이지 내용을 입력하세요...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean']
                ]
            }
        });
        
        // Set content if provided
        if (content) {
            quill.root.innerHTML = content;
        }
        
        // Store quill instance on the page editor div
        pageDiv.quillInstance = quill;
    }

    window.updatePageNumbers = function() {
        const pageEditors = editPagesContainer.querySelectorAll('.page-editor');
        pageEditors.forEach((editor, index) => {
            const pageNumber = editor.querySelector('.page-number');
            pageNumber.textContent = `페이지 ${index + 1}`;
        });
    };

    async function saveEdit() {
        if (!editingSermon) return;
        
        // Validate
        const newDate = editDate.value.trim();
        const newService = editService.value;
        const newTitle = editTitle.value.trim();
        const newCategory = editCategory.value;
        
        if (!newDate || !newTitle) {
            alert('날짜와 제목을 입력해주세요.');
            return;
        }
        
        // Collect pages from Quill editors
        const pageEditors = editPagesContainer.querySelectorAll('.page-editor');
        const newContent = Array.from(pageEditors).map(editor => {
            const quill = editor.quillInstance;
            if (quill) {
                return quill.root.innerHTML;
            }
            return '';
        });
        
        if (newContent.length === 0 || newContent.every(c => !c || c === '<p><br></p>')) {
            alert('최소 1개의 페이지 내용을 입력해주세요.');
            return;
        }
        
        try {
            // Update Firestore
            await updateDoc(doc(db, 'sermons', editingSermon.id), {
                date: newDate,
                service: newService,
                title: newTitle,
                category: newCategory,
                content: newContent
            });
            
            alert('설교가 수정되었습니다.');
            
            // Update local data
            const oldService = editingSermon.service;
            const oldIndex = editingSermon.index;
            
            // Remove from old service if service changed
            if (oldService !== newService) {
                sermonData[oldService].splice(oldIndex, 1);
                
                // Add to new service (at the beginning since we sort by date desc)
                sermonData[newService].unshift({
                    id: editingSermon.id,
                    date: newDate,
                    title: newTitle,
                    content: newContent,
                    service: newService,
                    category: newCategory
                });
                
                // Re-sort new service
                sermonData[newService].sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                
                // Close modal and refresh old service panel
                closeEditModalHandler();
                openDatePanel(oldService);
            } else {
                // Update in same service
                sermonData[oldService][oldIndex] = {
                    id: editingSermon.id,
                    date: newDate,
                    title: newTitle,
                    content: newContent,
                    service: newService,
                    category: newCategory
                };
                
                // Re-sort
                sermonData[oldService].sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                
                // Close modal and refresh panel
                closeEditModalHandler();
                openDatePanel(oldService);
            }
        } catch (error) {
            console.error('Error updating sermon:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    }

    // Edit Modal Event Listeners
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditModalHandler);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModalHandler);
    }
    
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEdit);
    }
    
    if (addPageBtn) {
        addPageBtn.addEventListener('click', () => addPageToEditor());
    }
    
    // Close modal when clicking outside
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditModalHandler();
            }
        });
    }

    // ========================================
    // Keyboard Navigation
    // ========================================
    document.addEventListener('keydown', function(e) {
        // Close modals on ESC
        if (e.key === 'Escape') {
            if (editModal.classList.contains('active')) {
                closeEditModalHandler();
            } else if (biblePanel.classList.contains('active')) {
                closeBiblePanelFunc();
            } else if (datePanel.classList.contains('active')) {
                closeDatePanel();
            }
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
// ========================================
// Sermon Page JavaScript
// ========================================

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

    // State
    let currentService = null;
    let currentDate = null;
    let currentPage = 0;
    let currentContent = null;

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
    // Sample Data (Replace with real data)
    // ========================================
    // const sermonData = {
    //     'sunday-morning': [
    //         {
    //             date: '2026.01.19',
    //             title: '주일오전예배 - 믿음으로 사는 삶',
    //             content: [
    //                 '<h3>본문: 히브리서 11:1-6</h3><p>믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니...</p><p>오늘 말씀을 통해 우리는 믿음의 본질에 대해 배우게 됩니다. 믿음은 단순한 지적 동의가 아니라, 하나님을 향한 전인격적 신뢰입니다.</p>',
    //                 '<h3>1. 믿음의 정의</h3><p>믿음은 바라는 것들의 실상입니다. 우리가 소망하는 것들이 이미 이루어진 것처럼 확신하는 것입니다.</p><p>보이지 않는 것들의 증거입니다. 눈으로 볼 수 없지만 실재하는 영적 세계를 받아들이는 것입니다.</p>',
    //                 '<h3>2. 믿음으로 산 선진들</h3><p>히브리서 11장은 믿음의 장이라 불립니다. 아벨, 에녹, 노아, 아브라함 등 믿음의 선진들이 어떻게 살았는지 보여줍니다.</p><p>그들은 약속을 받았으나 이루지 못했지만, 믿음으로 끝까지 하나님을 신뢰했습니다.</p>',
    //                 '<h3>결론</h3><p>우리도 믿음으로 살아가야 합니다. 보이는 것이 아니라 보이지 않는 것을 바라보며, 하나님의 약속을 붙잡고 나아가야 합니다.</p><p>오늘도 믿음으로 승리하는 하루가 되시기를 축복합니다.</p>'
    //             ]
    //         },
    //         {
    //             date: '2026.01.12',
    //             title: '주일오전예배 - 사랑의 계명',
    //             content: [
    //                 '<h3>본문: 요한복음 13:34-35</h3><p>새 계명을 너희에게 주노니 서로 사랑하라...</p><p>예수님께서 제자들에게 주신 새 계명은 바로 서로 사랑하라는 것입니다.</p>'
    //             ]
    //         }
    //     ],
    //     'sunday-afternoon': [
    //         {
    //             date: '2026.01.19',
    //             title: '주일오후예배 - 기도의 능력',
    //             content: [
    //                 '<h3>본문: 야고보서 5:16-18</h3><p>의인의 간구는 역사하는 힘이 큽니다...</p>'
    //             ]
    //         }
    //     ],
    //     'wednesday': [
    //         {
    //             date: '2026.01.15',
    //             title: '수요예배 - 말씀 묵상',
    //             content: [
    //                 '<h3>본문: 시편 1편</h3><p>복 있는 사람은 악인들의 꾀를 따르지 아니하며...</p>'
    //             ]
    //         }
    //     ],
    //     'friday': [
    //         {
    //             date: '2026.01.17',
    //             title: '금요예배 - 찬양과 경배',
    //             content: [
    //                 '<h3>본문: 시편 150편</h3><p>할렐루야 그의 성소에서 하나님을 찬양하라...</p>'
    //             ]
    //         }
    //     ],
    //     'sunday-school': [
    //         {
    //             date: '2026.01.19',
    //             title: '주일학교 - 다윗과 골리앗',
    //             content: [
    //                 '<h3>본문: 사무엘상 17장</h3><p>다윗은 작은 소년이었지만 하나님을 믿는 큰 믿음이 있었습니다...</p>'
    //             ]
    //         }
    //     ]
    // };

    const sermonData = {
        'sunday-morning': [],
        'sunday-afternoon': [],
        'wednesday': [],
        'friday': [],
        'sunday-school': []
    };

    // ========================================
    // Service Button Click
    // ========================================
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const service = this.getAttribute('data-service');
            currentService = service;

            // Update active state
            serviceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Open date panel
            openDatePanel(service);
        });
    });

    // ========================================
    // Date Panel Functions
    // ========================================
    function openDatePanel(service) {
        const serviceName = getServiceName(service);
        datePanelTitle.textContent = serviceName + ' 날짜 선택';

        // Populate dates
        const dates = sermonData[service] || [];
        dateList.innerHTML = '';

        if (dates.length === 0) {
            dateList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">등록된 설교가 없습니다.</p>';
        } else {
            dates.forEach((sermon, index) => {
                const dateItem = document.createElement('div');
                dateItem.className = 'date-item';
                dateItem.innerHTML = `
                    <div class="date-item-date">${sermon.date}</div>
                    <div class="date-item-title">${sermon.title}</div>
                `;
                dateItem.addEventListener('click', function() {
                    selectDate(service, index);
                });
                dateList.appendChild(dateItem);
            });
        }

        // Show panel
        datePanel.classList.add('active');
        panelOverlay.classList.add('active');
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
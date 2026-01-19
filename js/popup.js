// Popup Modal JavaScript
(function() {
    'use strict';

    // DOM Elements
    let popupModal;
    let popupBody;
    let popupClose;

    // Initialize on DOM loaded
    document.addEventListener('DOMContentLoaded', function() {
        initPopup();
    });

    function initPopup() {
        // Get DOM elements
        popupModal = document.getElementById('popupModal');
        popupBody = document.getElementById('popupBody');
        popupClose = document.getElementById('popupClose');

        if (!popupModal) return;

        // Close button event
        if (popupClose) {
            popupClose.addEventListener('click', closePopup);
        }

        // Close on outside click
        popupModal.addEventListener('click', function(e) {
            if (e.target === popupModal) {
                closePopup();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popupModal.classList.contains('active')) {
                closePopup();
            }
        });

        // Popup triggers
        const popupTriggers = document.querySelectorAll('.popup-trigger');
        popupTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const popupType = this.getAttribute('data-popup');
                openPopup(popupType);
            });
        });
    }

    function openPopup(type) {
        if (!popupModal || !popupBody) return;

        // Set content based on type
        const content = getPopupContent(type);
        popupBody.innerHTML = content;

        // Show modal
        popupModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        if (!popupModal) return;

        popupModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear content after animation
        setTimeout(() => {
            if (popupBody) {
                popupBody.innerHTML = '';
            }
        }, 300);
    }

    function getPopupContent(type) {
        const contents = {
            'jubo': `
                <h2 style="text-align: center; margin-bottom: 30px; font-size: 2rem;">주보</h2>
                <div id="juboContainer" style="text-align: center; padding: 20px; max-height: 70vh; overflow-y: auto;">
                    <!-- 주보 없을 때 메시지 (기본 숨김) -->
                    <div id="juboEmptyMessage" style="display: none; padding: 60px 20px;">
                        <p style="font-size: 1.2rem; color: #666;">등록된 주보가 없습니다.</p>
                    </div>
                    
                    <div id="juboContent">
                        <div id="juboImages" style="display: flex; flex-direction: column; gap: 20px; align-items: center;">
                            <!-- 주보 1페이지 -->
                            <div id="juboPage1" class="jubo-page" style="width: 100%; max-width: 800px;">
                                <img src="assets/images/jubo/jubo_1.png" 
                                     alt="주보 1페이지" 
                                     class="jubo-img"
                                     data-page="1"
                                     onload="window.handleJuboImageLoad(1)"
                                     onerror="window.handleJuboImageError(1)"
                                     style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            </div>
                            
                            <!-- 주보 2페이지 -->
                            <div id="juboPage2" class="jubo-page" style="width: 100%; max-width: 800px;">
                                <img src="assets/images/jubo/jubo_2.png" 
                                     alt="주보 2페이지" 
                                     class="jubo-img"
                                     data-page="2"
                                     onload="window.handleJuboImageLoad(2)"
                                     onerror="window.handleJuboImageError(2)"
                                     style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            </div>
                        </div>
                        
                        <!-- 다운로드 버튼들 -->
                        <div id="juboDownloadButtons" style="margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                            <a id="juboDownload1" href="assets/images/jubo/jubo_1.png" download="주보_1페이지.png" 
                               class="jubo-download-btn"
                               style="display: none; padding: 12px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
                                1페이지 다운로드
                            </a>
                            <a id="juboDownload2" href="assets/images/jubo/jubo_2.png" download="주보_2페이지.png" 
                               class="jubo-download-btn"
                               style="display: none; padding: 12px 30px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
                                2페이지 다운로드
                            </a>
                        </div>
                    </div>
                </div>
            `,
            'bible_reading': `
                <h2 style="text-align: center; margin-bottom: 30px; font-size: 2rem;">성경읽기표</h2>
                <div style="text-align: center; padding: 40px;">
                    <img src="assets/images/bible_reading/bible_reading.png" 
                         alt="성경읽기표" 
                         style="max-width: 100%; height: auto; margin: 0 auto;">
                </div>
            `
        };

        return contents[type] || '<p style="text-align: center; padding: 40px;">내용을 찾을 수 없습니다.</p>';
    }

    // Expose functions globally
    window.openPopup = openPopup;
    window.closePopup = closePopup;
    window.popup = openPopup; // For backward compatibility

    // Jubo image handling
    let juboLoadedImages = {
        1: false,
        2: false
    };
    let juboCheckedImages = {
        1: false,
        2: false
    };

    window.handleJuboImageLoad = function(pageNum) {
        juboLoadedImages[pageNum] = true;
        juboCheckedImages[pageNum] = true;
        
        // 이미지 로드 성공 시 다운로드 버튼 표시
        const downloadBtn = document.getElementById('juboDownload' + pageNum);
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-block';
        }
        
        checkJuboStatus();
    };

    window.handleJuboImageError = function(pageNum) {
        juboLoadedImages[pageNum] = false;
        juboCheckedImages[pageNum] = true;
        
        // 이미지 로드 실패 시 페이지 숨기기
        const pageDiv = document.getElementById('juboPage' + pageNum);
        if (pageDiv) {
            pageDiv.style.display = 'none';
        }
        
        checkJuboStatus();
    };

    function checkJuboStatus() {
        // 두 이미지 모두 체크 완료되었는지 확인
        if (juboCheckedImages[1] && juboCheckedImages[2]) {
            // 둘 다 로드 실패한 경우
            if (!juboLoadedImages[1] && !juboLoadedImages[2]) {
                const juboContent = document.getElementById('juboContent');
                const juboEmptyMessage = document.getElementById('juboEmptyMessage');
                
                if (juboContent) juboContent.style.display = 'none';
                if (juboEmptyMessage) juboEmptyMessage.style.display = 'block';
            }
        }
    }

    // 팝업 열릴 때마다 주보 상태 리셋
    const originalOpenPopup = openPopup;
    openPopup = function(type) {
        if (type === 'jubo') {
            // 상태 리셋
            juboLoadedImages = { 1: false, 2: false };
            juboCheckedImages = { 1: false, 2: false };
        }
        originalOpenPopup(type);
    };
    window.openPopup = openPopup;

})();
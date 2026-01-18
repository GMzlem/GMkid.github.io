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
                <div style="text-align: center; padding: 40px;">
                    <p style="font-size: 1.2rem; color: #666;">주보 내용이 여기에 표시됩니다.</p>
                    <p style="margin-top: 20px;">PDF 파일을 업로드하거나 이미지를 추가해주세요.</p>
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

})();

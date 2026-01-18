// Swiper Slider Initialization
(function() {
    'use strict';

    // Initialize on DOM loaded
    document.addEventListener('DOMContentLoaded', function() {
        initSwiper();
    });

    function initSwiper() {
        // Initialize Swiper
        const swiper = new Swiper('.mySwiper', {
            // Loop mode (무한 루프)
            loop: true,
            
            // Speed
            speed: 500,
            
            // Autoplay
            autoplay: {
                delay: 5000,
                disableOnInteraction: false, // 사용자 조작 후에도 계속 자동재생
                pauseOnMouseEnter: true, // 마우스 호버 시 일시정지
            },
            
            // Effect
            effect: 'slide',
            
            // Grab Cursor
            grabCursor: true,
            
            // Touch ratio (드래그 민감도)
            touchRatio: 1,
            
            // Resistance (경계에서 저항감)
            resistance: true,
            resistanceRatio: 0.85,
            
            // Prevent clicks during drag
            preventClicks: true,
            preventClicksPropagation: true,
            
            // Allow touch move (실시간 드래그)
            allowTouchMove: true,
            
            // Follow finger (손가락/마우스 따라 실시간 이동)
            followFinger: true,
            
            // Short swipes (짧은 스와이프도 인식)
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            
            // Keyboard control
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            
            // Mouse wheel
            mousewheel: {
                forceToAxis: true,
            },
            
            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            // Pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: false,
            },
            
            // Events
            on: {
                // Slide가 클릭되었을 때만 액션 실행
                click: function(swiper, event) {
                    handleSlideClick(event);
                },
            }
        });

        // Handle slide click (드래그가 아닐 때만 실행)
        function handleSlideClick(event) {
            // 가장 가까운 swiper-slide 찾기
            const slide = event.target.closest('.swiper-slide');
            if (!slide) return;

            const action = slide.getAttribute('data-action');
            const target = slide.getAttribute('data-target');

            if (!action || !target) return;

            switch(action) {
                case 'popup':
                    // Open popup
                    if (window.openPopup) {
                        window.openPopup(target);
                    }
                    break;

                case 'scroll':
                    // Scroll to section
                    const element = document.getElementById(target);
                    if (element) {
                        const offsetTop = element.offsetTop - 100;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                    break;

                case 'link':
                    // Navigate to page
                    window.location.href = target;
                    break;
            }
        }
    }

})();

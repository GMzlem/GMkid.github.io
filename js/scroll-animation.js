// Scroll Animation using Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // JavaScript 로드 완료 표시 (CSS에서 애니메이션 활성화)
    document.body.classList.add('js-loaded');
    
    // Intersection Observer 옵션
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -100px 0px', // 뷰포트 하단에서 100px 전에 트리거
        threshold: 0.1 // 요소의 10%가 보이면 트리거
    };

    // Observer 콜백 함수
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 요소가 화면에 들어오면 'visible' 클래스 추가
                entry.target.classList.add('visible');
                
                // 한 번 애니메이션 후 관찰 중지 (선택사항)
                // observer.unobserve(entry.target);
            }
        });
    };

    // Observer 생성
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 애니메이션 적용할 요소들 선택
    const animateElements = document.querySelectorAll('.scroll-animate, .scroll-animate-children, .fade-in');

    // 모든 요소 관찰 시작
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // 페이지 로드 시 이미 화면에 보이는 요소들 처리
    // (첫 화면에 보이는 요소들은 즉시 표시)
    const checkInitialVisibility = () => {
        animateElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0 &&
                rect.top <= window.innerHeight
            );
            
            if (isVisible) {
                element.classList.add('visible');
            }
        });
    };

    // 페이지 로드 시 이미 화면에 보이는 요소들 즉시 처리
    checkInitialVisibility();
});
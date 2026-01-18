# 예슈아 사랑교회 웹사이트

예슈아 사랑교회의 공식 웹사이트입니다.

## 📁 프로젝트 구조

```
yeshua-church/
├── index.html              # 메인 페이지
├── sundayschool.html       # 주일학교 페이지
├── css/                    # 스타일시트 폴더
│   ├── reset.css          # CSS 리셋
│   ├── style.css          # 메인 스타일
│   ├── navbar.css         # 네비게이션 스타일
│   ├── slider.css         # 슬라이더 스타일
│   ├── sections.css       # 섹션별 스타일
│   └── sundayschool.css   # 주일학교 페이지 스타일
├── js/                     # JavaScript 폴더
│   ├── app.js             # 메인 애플리케이션 로직
│   ├── slider.js          # 이미지 슬라이더 기능
│   └── popup.js           # 팝업 모달 기능
├── assets/                 # 리소스 폴더
│   └── images/            # 이미지 파일들
│       ├── kaicam.jpg
│       ├── logo_ver3.png
│       ├── background.jpg
│       ├── bg_blur.png
│       ├── news.png
│       ├── left.png
│       ├── right.png
│       ├── bible_reading/
│       │   └── bible_reading.png
│       ├── wednesday.png
│       ├── friday.jpg
│       ├── sunday_1.png
│       ├── sunday_2.png
│       └── sundayschool.png
└── README.md              # 프로젝트 설명서
```

## 🚀 주요 기능

### 1. 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 화면 제공
- 미디어 쿼리를 활용한 적응형 레이아웃

### 2. 이미지 슬라이더
- 자동 재생 기능 (5초 간격)
- 좌우 버튼으로 수동 조작 가능
- 인디케이터를 통한 빠른 이동
- 터치/스와이프 제스처 지원 (모바일)
- 키보드 방향키 지원
- 마우스 호버 시 자동 재생 일시정지

### 3. 네비게이션
- 고정형 네비게이션 바 (스크롤 시 상단 고정)
- 스무스 스크롤 기능
- 모바일 햄버거 메뉴
- 활성 메뉴 하이라이트

### 4. 팝업 모달
- 주보 보기 기능
- 성경읽기표 표시
- ESC 키 또는 외부 클릭으로 닫기

### 5. 상단 이동 버튼
- 페이지 스크롤 시 자동 표시
- 원클릭으로 페이지 최상단 이동

## 🎨 디자인 특징

- **컬러 스킴**: 파란색(#50a2e9)을 주 색상으로 사용
- **폰트**: 맑은 고딕, Arial 폰트 사용
- **레이아웃**: 모던하고 깔끔한 카드 기반 디자인
- **애니메이션**: 부드러운 전환 효과 (transition, transform)

## 💻 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: 
  - Flexbox & Grid 레이아웃
  - CSS Variables (사용자 정의 속성)
  - Media Queries (반응형)
  - Transitions & Animations
- **JavaScript (ES6+)**:
  - 모듈 패턴 (IIFE)
  - 이벤트 리스너
  - DOM 조작
  - 터치 이벤트

## 📱 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 🔧 설치 및 실행

### 파일 직접 열기 (가장 쉬운 방법)
```
모든 경로가 상대 경로로 설정되어 있어 HTML 파일을 직접 열어도 작동합니다!

1. index.html 파일을 브라우저로 드래그 앤 드롭
   또는
2. index.html 파일을 더블클릭

※ 단, assets/images/ 폴더에 이미지 파일이 있어야 합니다.
```

### 로컬 서버로 실행

```bash
# Python 3 사용 시
python -m http.server 8000

# Node.js 사용 시 (http-server 필요)
npx http-server

# 브라우저에서 접속
http://localhost:8000
```

### 파일 배치

1. 모든 파일을 서버의 웹 루트 디렉토리에 배치
2. `/assets/images/` 폴더에 이미지 파일 업로드
3. 브라우저에서 `index.html` 접속

## 📋 페이지 구성

### 메인 페이지 (index.html)
1. **헤더**: 교회 로고 및 이름
2. **성경 구절 배너**: 말씀 표시
3. **이미지 슬라이더**: 교회 활동 소개
4. **네비게이션**: 메인 메뉴
5. **교회소개**: 비전 및 목표 안내
6. **예배안내**: 예배 시간표
7. **교회소식**: 공지사항
8. **오시는길**: 구글 지도 및 주소
9. **푸터**: 교회 로고

### 주일학교 페이지 (sundayschool.html)
1. **히어로 섹션**: 주일학교 타이틀
2. **안내 섹션**: 시간, 장소, 대상, 목표
3. **소개 섹션**: 교육 내용
4. **문의 섹션**: 등록 및 문의 링크

## 🛠️ 커스터마이징

### 색상 변경
`css/style.css` 파일의 `:root` 섹션에서 색상 변수 수정:

```css
:root {
    --primary-color: #50a2e9;      /* 주 색상 */
    --secondary-color: #a7a7a7;    /* 보조 색상 */
    --text-dark: #323232;          /* 진한 텍스트 */
    --text-light: #9e9e9e;         /* 연한 텍스트 */
}
```

### 슬라이더 속도 조절
`js/slider.js` 파일의 설정 변경:

```javascript
const AUTOPLAY_INTERVAL = 5000;     // 자동재생 간격 (밀리초)
const TRANSITION_DURATION = 500;    // 전환 효과 시간 (밀리초)
```

### 이미지 추가/변경
1. `assets/images/` 폴더에 이미지 업로드 (상대 경로)
2. HTML 파일에서 이미지 경로 수정 (예: `assets/images/파일명.png`)
3. 슬라이더에 이미지 추가 시 HTML의 슬라이더 섹션에 slide 추가

**중요**: 모든 경로는 상대 경로를 사용하므로 `/`로 시작하지 않습니다!

## 📞 문의

예슈아 사랑교회
- 주소: 경기도 안산시 상록구 샘골로 40
- 온라인 등록: https://open.kakao.com/o/scbvDSfg

---

© 2024 예슈아 사랑교회. All rights reserved.

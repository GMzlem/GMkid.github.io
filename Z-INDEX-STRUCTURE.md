# Z-Index 체계 정리 문서

## 📋 전체 z-index 구조

### 1️⃣ Base Layout (1-10)
```
section-bg           : 0   (배경 이미지)
section-content      : 1   (콘텐츠 컨테이너)
header-title         : 1   (헤더 제목)
header               : 10  (헤더 전체)
```

### 2️⃣ Navigation (11-20)
```
navbar               : 15  (네비게이션 바)
```

### 3️⃣ UI Elements (21-30)
```
back-to-top          : 25  (맨 위로 버튼)
```

### 4️⃣ Overlays & Modals (31-40)
```
popup-modal          : 35  (팝업 모달)
```

### 5️⃣ Mobile Menu (41-50)
```
menu-overlay         : 45  (메뉴 배경 오버레이)
navbar-menu          : 46  (모바일 메뉴 내용)
menu-toggle          : 47  (햄버거/X 버튼)
```

---

## 🎯 설계 원칙

### 1. 범위별 그룹화
- **1-10**: 기본 레이아웃
- **11-20**: 네비게이션
- **21-30**: UI 요소
- **31-40**: 오버레이/모달
- **41-50**: 모바일 메뉴

### 2. 확장 가능성
각 범위 내에 여유 공간이 있어서 나중에 요소 추가 가능

### 3. 명확한 계층
숫자만 봐도 어느 레이어인지 즉시 파악 가능

---

## 🔧 주요 수정 사항

### Before (문제)
```css
menu-toggle    : 99999  ❌ 과도하게 높음
navbar-menu    : 9999   ❌ 불필요하게 높음
menu-overlay   : 9998   ❌ 체계 없음
popup-modal    : 200    ❌ 일관성 없음
navbar         : 50     ❌ 범위 불분명
back-to-top    : 100    ❌ 범위 불분명
```

### After (해결)
```css
menu-toggle    : 47     ✅ 체계적
navbar-menu    : 46     ✅ 일관성
menu-overlay   : 45     ✅ 명확
popup-modal    : 35     ✅ 그룹화
navbar         : 15     ✅ 논리적
back-to-top    : 25     ✅ 적절
```

---

## 💡 X 버튼 색상 문제 해결

### 문제
```css
/* X 버튼이 흰색 */
.menu-toggle span {
    background-color: var(--white);
}
```
→ 흰색 메뉴 배경에 흰색 X = 안 보임!

### 해결
```css
/* 메뉴 열렸을 때 색상 변경 */
.menu-toggle.active span {
    background-color: var(--text-dark);
}
```
→ 어두운 색으로 변경하여 명확하게 보임!

---

## ✅ 장점

1. **유지보수 용이**: 숫자만 봐도 어디 레이어인지 파악
2. **확장 가능**: 각 범위 내 여유 공간
3. **충돌 방지**: 명확한 계층 구조
4. **디버깅 쉬움**: 문제 발생 시 빠른 파악

---

## 📝 파일별 z-index 목록

### style.css
- `.header`: 10
- `.header-title`: 1
- `.menu-toggle`: 47
- `.back-to-top`: 25
- `.section-bg`: 0
- `.section-content`: 1

### navbar.css
- `.navbar`: 15
- `.navbar-menu`: 46
- `.menu-overlay`: 45

### sections.css
- `.popup-modal`: 35

---

**작성일**: 2026-01-19
**버전**: 1.0
**작성자**: Claude

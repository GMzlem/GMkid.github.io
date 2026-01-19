# 슬라이더 배경 커스터마이징 가이드

## ✅ 완료된 수정사항

### 1. 둥근 모서리 → 직사각형
```css
border-radius: 12px → 0
```
모든 화면 크기(데스크톱, 태블릿, 모바일)에서 직사각형으로 변경 완료!

---

## 🎨 양옆 공백 배경 변경 방법

### 현재 설정
```css
.slider-section {
    background-color: #f8f9fa;  /* 밝은 회색 */
}
```

### 옵션 1: 단색 배경
```css
.slider-section {
    background-color: #ffffff;  /* 흰색 */
}
```

**색상 예시:**
- 흰색: `#ffffff`
- 검정: `#000000`
- 파란색: `#2c5aa0` (현재 헤더와 같은 색)
- 밝은 회색: `#f8f9fa`
- 어두운 회색: `#6c757d`

---

### 옵션 2: 이미지 배경

#### 방법 1: 배경 이미지 꽉 채우기
```css
.slider-section {
    background-image: url('../assets/images/배경이미지.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

#### 방법 2: 패턴 반복
```css
.slider-section {
    background-image: url('../assets/images/패턴.png');
    background-repeat: repeat;
    background-size: 200px 200px;
}
```

#### 방법 3: 그라데이션 배경
```css
.slider-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

### 옵션 3: 이미지 + 색상 오버레이
```css
.slider-section {
    background-image: 
        linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
        url('../assets/images/배경이미지.jpg');
    background-size: cover;
    background-position: center;
}
```

---

## 📁 파일 위치

**CSS 파일:**
```
css/slider.css
```

**수정할 부분:**
```css
/* 7-11번 줄 */
.slider-section {
    background-color: #f8f9fa;  ← 여기 수정!
}
```

---

## 💡 추천 조합

### 1. 깔끔한 느낌
```css
background-color: #ffffff;
```

### 2. 부드러운 느낌
```css
background-color: #f8f9fa;
```

### 3. 헤더와 통일감
```css
background: linear-gradient(135deg, #1a3d6f 0%, #2c5aa0 100%);
```

### 4. 교회 이미지 배경
```css
background-image: url('../assets/images/church-background.jpg');
background-size: cover;
background-position: center;
```

---

## 🎯 실전 예시

### 예시 1: 흰색 배경
```css
.slider-section {
    background-color: #ffffff;
    padding: 0 20px;
}
```

### 예시 2: 교회 사진 배경
```css
.slider-section {
    background-image: url('../assets/images/church-background.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;  /* 스크롤 시 고정 */
    padding: 0 20px;
}
```

---

## 📝 참고사항

1. **이미지 파일 경로**: `assets/images/` 폴더에 이미지 넣기
2. **파일명**: 영문/숫자만 사용 (띄어쓰기 X)
3. **권장 이미지 크기**: 가로 1920px 이상
4. **파일 형식**: jpg, png, webp

---

**작성일**: 2026-01-19
**파일**: css/slider.css

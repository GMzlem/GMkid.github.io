# 설교 페이지 디버깅 가이드

## 문제: 날짜 선택 창이 안 뜸

### 1단계: 하드 리프레시
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2단계: 콘솔 확인
```
F12 → Console 탭
```

아래와 같은 로그가 나와야 정상이에요:

```
페이지 로드 - 설교 데이터 로드 시작
설교 데이터 로드 시작...
Firestore에서 가져온 문서 수: X
문서 처리: xxx 타입: sunday-morning
✅ 모든 설교 로드 완료!
📊 데이터: {sunday-morning: Array(X), ...}
```

### 3단계: 버튼 클릭 후 확인
주일 오전 버튼 클릭 → 콘솔에 이렇게 나와야 해요:

```
🔘 버튼 클릭: sunday-morning
✅ 캐시된 데이터 사용
📋 sunday-morning 설교 개수: X
📅 openDatePanel 호출: sunday-morning
📋 날짜 목록: [...]
✅ X개 설교 표시
🎬 패널 열기 시도...
datePanel: div#datePanel.date-panel
panelOverlay: div#panelOverlay.panel-overlay
✅ 패널 클래스 추가 완료
datePanel has active: true
```

---

## 가능한 문제들

### 문제 1: "Firestore에서 가져온 문서 수: 0"
**원인:** Firestore에 설교 데이터가 없음
**해결:**
1. Firebase Console → Firestore Database 확인
2. admin.html에서 설교 추가
3. 새로고침 후 다시 테스트

### 문제 2: "Error loading sermons"
**원인:** Firebase 설정 오류 또는 네트워크 문제
**해결:**
1. Firebase Console → Firestore Database가 생성되었는지 확인
2. 네트워크 연결 확인
3. js/firebase-config.js 설정 확인

### 문제 3: "datePanel: null" 또는 "panelOverlay: null"
**원인:** HTML 요소를 찾을 수 없음
**해결:**
1. sermon.html 파일이 최신 버전인지 확인
2. id="datePanel" 요소가 있는지 확인
3. id="panelOverlay" 요소가 있는지 확인

### 문제 4: 패널이 보이지 않음 (datePanel has active: true인데도)
**원인:** CSS 문제
**해결:**
1. css/sermon.css 파일 확인
2. .date-panel.active 스타일 확인
3. z-index 문제 확인

### 문제 5: 여전히 느림
**원인:** 브라우저 캐시가 안 지워짐
**해결:**
```
1. F12 → Network 탭
2. "Disable cache" 체크
3. 새로고침
```

---

## 빠른 테스트

### 1. Firestore에 테스트 데이터 추가
Firebase Console → Firestore Database → Add document

```
Collection: sermons
Document ID: (auto)
Fields:
  service: "sunday-morning"
  date: "2026.01.19"
  title: "테스트 설교"
  content: ["<p>테스트 내용</p>"]
  timestamp: (server timestamp)
```

### 2. 로컬 서버 실행
```bash
cd yeshua-church-optimized
python -m http.server 8000
```

### 3. 브라우저 접속
```
http://localhost:8000/sermon.html
```

### 4. 콘솔 열고 확인
```
F12 → Console
```

### 5. 주일 오전 클릭
모든 로그가 정상적으로 나오는지 확인

---

## 스크린샷 보내주세요

콘솔에 나오는 로그를 복사해서 보내주시면 정확히 진단할 수 있어요!

특히 이런 에러들:
- ❌ 빨간 에러 메시지
- ⚠️ 노란 경고 메시지
- 예상과 다른 로그 값

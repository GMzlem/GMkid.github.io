# 예슈아 사랑교회 웹사이트 - 회원 시스템 버전

## 주요 기능

✅ **회원 시스템**
- 회원가입 / 로그인 기능 (이메일 & Google)
- Google 소셜 로그인 지원
- 메인 페이지 우상단 로그인 버튼
- 로그인 상태 표시 (환영합니다, OOO님)
- 일반 회원 / 관리자 구분

✅ **관리자 기능**
- Firebase Authentication을 통한 로그인
- Firestore를 사용한 설교 데이터 저장
- 관리자만 설교 추가/삭제 가능

✅ **회원 전용 콘텐츠** (예정)
- 주일학교 사진 갤러리 (회원 전용)
- 교회 소식 상세보기 (회원 전용)
- 온라인 예배 다시보기 (회원 전용)

## 새로운 기능

### 1. 회원가입 / 로그인
- **메인 페이지** 우상단에 "로그인" 버튼
- 클릭 시 **회원가입 | 로그인** 페이지로 이동
- 탭으로 회원가입/로그인 전환 가능
- **Google 소셜 로그인** 지원 (간편 로그인)

### 2. 로그인 상태 표시
- 로그인 후 우상단에 **"OOO님"** 표시
- 관리자는 **"관리자"** 뱃지 표시
- 로그아웃 버튼 제공

### 3. 일반 회원 vs 관리자
- **일반 회원**: 설교 읽기, 회원 전용 콘텐츠 이용
- **관리자**: 설교 추가/삭제, 관리자 페이지 접근

## 빠른 시작

### 1단계: Firebase 프로젝트 설정 (이미 완료!)
```
Firebase 설정은 이미 입력되어 있습니다.
js/firebase-config.js에 설정 정보가 들어있습니다.
```

### 2단계: Authentication 활성화
```
Firebase Console → Authentication
→ 이메일/비밀번호 활성화
```

### 3단계: 관리자 계정 생성
```
1. Authentication → 사용자 → 사용자 추가
2. 이메일/비밀번호 입력
3. 생성된 UID 복사
4. js/auth.js의 ADMIN_UIDS에 추가
```

### 4단계: Firestore 생성
```
Firestore Database 생성
→ 위치: asia-northeast3 (서울)
→ 보안 규칙 설정 (firestore.rules 참조)
```

### 5단계: 관리자 추가 (중요!)
```
Firestore → admins 컬렉션 생성
→ 문서 ID: 관리자 UID
→ 필드: isAdmin = true
상세 가이드: ADMIN_SETUP.md 참조
```

### 6단계: 로컬 서버로 실행
```bash
python -m http.server 8000
# 브라우저에서: http://localhost:8000
```

## 사용 방법

### 일반 회원
1. 메인 페이지 우상단 **"로그인"** 클릭
2. **"회원가입"** 탭 선택
3. 이메일/비밀번호 입력 후 가입
4. 로그인하여 회원 전용 콘텐츠 이용

### 관리자
1. Firestore에 관리자 추가 (ADMIN_SETUP.md 참조)
   - Firestore → admins 컬렉션
   - 문서 ID = 사용자 UID
   - isAdmin = true
2. 로그인 후 **"관리자 페이지"** 버튼 표시됨
3. 설교 추가/삭제 권한 부여

**참고:** 이제 관리자 UID가 코드에 없어요! 더 안전합니다 🔒

## 파일 구조

```
├── index.html              # 메인 페이지 (로그인 버튼 추가)
├── login.html              # 로그인/회원가입 페이지 (탭 방식)
├── sermon.html             # 설교 페이지
├── admin.html              # 관리자 페이지 (설교 추가)
├── js/
│   ├── firebase-config.js  # Firebase 설정 (이미 입력됨)
│   ├── auth.js            # 인증 관리 (회원가입 함수 추가)
│   ├── auth-ui.js         # 메인 페이지 인증 UI 관리
│   └── sermon.js          # 설교 페이지 로직
├── css/
│   └── navbar.css         # 네비게이션 스타일 (로그인 버튼)
└── FIREBASE_SETUP.md      # 상세 설정 가이드
```

## 주요 변경 사항

### index.html
- 헤더에 로그인 버튼 추가
- 로그인 상태에 따라 UI 변경
- auth-ui.js 모듈 추가

### login.html
- 회원가입/로그인 탭 추가
- 회원가입 폼 추가
- 비밀번호 확인 기능

### auth.js
- `signup()` 함수 추가 (회원가입)
- `loginWithGoogle()` 함수 추가 (Google 로그인)
- Firebase 에러 메시지 한글화
- **Firestore 기반 관리자 체크** (코드에 UID 없음!)
- `isAdmin()` 함수가 Firestore에서 관리자 확인

### auth-ui.js (새로운 파일)
- 메인 페이지의 로그인 상태 관리
- 로그인/로그아웃 버튼 이벤트
- 사용자 이름 표시

### navbar.css
- 로그인 버튼 스타일
- 사용자 정보 표시 스타일
- 반응형 디자인

## 회원 전용 콘텐츠 만들기

### 예시: 주일학교 사진 보호

```javascript
// sundayschool.html에서
import { getCurrentUser } from './js/auth.js';

const user = getCurrentUser();

if (!user) {
    // 로그인하지 않은 사용자
    alert('회원 전용 콘텐츠입니다. 로그인해주세요.');
    window.location.href = 'login.html';
} else {
    // 로그인한 사용자 - 사진 표시
    showPhotos();
}
```

### Firestore 보안 규칙 예시

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 설교 - 누구나 읽기, 인증된 사용자만 쓰기
    match /sermons/{sermonId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // 회원 전용 사진 - 로그인한 회원만 읽기
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## 주의사항

1. **로컬 서버 필요**: `file://`로는 작동 안 함
   ```bash
   python -m http.server 8000
   ```

2. **관리자 UID 설정 필수**: `js/auth.js`의 `ADMIN_UIDS`에 관리자 UID 추가

3. **Firestore 보안 규칙**: 반드시 설정하세요

4. **비밀번호**: Firebase는 최소 6자 이상 요구

## 트러블슈팅

### 회원가입이 안 돼요
- Firebase Console → Authentication → 이메일/비밀번호 활성화 확인
- 비밀번호가 6자 이상인지 확인

### 로그인 후 이름이 안 보여요
- 브라우저 하드 리프레시: `Ctrl + Shift + R`
- 로컬 서버로 실행 중인지 확인

### 관리자인데 관리자 페이지가 안 보여요
- `js/auth.js`의 `ADMIN_UIDS`에 UID를 추가했는지 확인
- Firebase Console → Authentication에서 UID 확인

## 다음 단계

- [ ] 주일학교 사진 갤러리 (회원 전용)
- [ ] 회원 프로필 페이지
- [ ] 이메일 인증 추가
- [ ] 비밀번호 재설정 기능
- [ ] 소셜 로그인 (Google, Kakao)

## 이미지 출처

웹사이트에 사용된 이미지의 출처는 `CREDITS.md` 파일을 참조하세요.

### 주요 이미지
- **sermon.jpg**: https://goodday1318.tistory.com/37#google_vignette

## 문의

문제가 발생하면 FIREBASE_SETUP.md를 참조하거나 개발자에게 문의하세요.

# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: yeshua-church)
4. Google 애널리틱스 설정 (선택사항)
5. 프로젝트 생성 완료

## 2. Firebase 웹 앱 추가

1. Firebase Console에서 프로젝트 선택
2. 프로젝트 설정 > 일반 > "앱 추가" 선택
3. 웹 아이콘 (</>) 클릭
4. 앱 닉네임 입력
5. Firebase 구성 정보 복사

## 3. Firebase 설정 파일 업데이트

`js/firebase-config.js` 파일을 열고 Firebase 구성 정보를 입력하세요:

```javascript
const firebaseConfig = {
    apiKey: "여기에_API_KEY_입력",
    authDomain: "프로젝트_ID.firebaseapp.com",
    projectId: "프로젝트_ID",
    storageBucket: "프로젝트_ID.appspot.com",
    messagingSenderId: "메시징_센더_ID",
    appId: "앱_ID"
};
```

## 4. Firebase Authentication 설정

1. Firebase Console > Authentication > 시작하기
2. "로그인 방법" 탭 선택
3. "이메일/비밀번호" 활성화
4. "Google" 활성화:
   - Google 로그인 방법 클릭
   - "사용 설정" 토글 ON
   - 프로젝트 공개용 이름 입력 (예: 예슈아 사랑교회)
   - 프로젝트 지원 이메일 선택
   - "저장" 클릭
5. "사용자" 탭에서 관리자 계정 생성:
   - "사용자 추가" 클릭
   - 이메일과 비밀번호 입력
   - 사용자 UID 복사 (나중에 필요함)

## 5. Firebase Firestore 설정

1. Firebase Console > Firestore Database
2. "데이터베이스 만들기" 클릭
3. 위치 선택 (asia-northeast3 권장 - 서울)
4. 프로덕션 모드로 시작

### Firestore 보안 규칙 설정

Firebase Console > Firestore Database > 규칙 탭에서 다음 규칙을 입력:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 설교 컬렉션
    match /sermons/{sermonId} {
      // 모든 사용자가 읽기 가능
      allow read: if true;
      
      // 인증된 사용자만 생성/수정/삭제 가능
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

**중요**: 더 강력한 보안을 위해 특정 관리자 UID만 허용하려면:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sermons/{sermonId} {
      allow read: if true;
      
      // 특정 관리자 UID만 허용
      allow create, update, delete: if request.auth != null && 
        request.auth.uid in [
          "여기에_관리자_UID_1",
          "여기에_관리자_UID_2"
        ];
    }
  }
}
```

## 6. 관리자 UID 설정

`js/auth.js` 파일을 열고 관리자 UID를 입력:

```javascript
const ADMIN_UIDS = [
    '여기에_관리자_UID_입력',  // Firebase Console > Authentication에서 복사한 UID
];
```

## 7. 배포

### GitHub Pages에 배포:

1. GitHub 저장소 생성
2. 모든 파일 커밋 & 푸시
3. Settings > Pages > Source: main branch 선택
4. 배포 완료!

### Firebase Hosting에 배포 (선택사항):

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 배포
firebase deploy
```

## 8. 사용 방법

### 관리자 로그인:
1. `your-site.com/login.html` 접속
2. Firebase에서 생성한 관리자 이메일/비밀번호로 로그인

### 설교 추가:
1. 로그인 후 "관리자 페이지" 버튼 클릭
2. 예배 유형, 날짜, 제목 입력
3. 설교 내용 작성 (HTML 형식)
4. 페이지가 여러 개면 "페이지 추가" 버튼으로 추가
5. "설교 추가" 버튼 클릭

### 설교 삭제:
1. sermon.html에서 예배 선택
2. 삭제하고 싶은 설교의 "삭제" 버튼 클릭 (관리자만 보임)

## 트러블슈팅

### CORS 에러 발생 시:
- 로컬에서 테스트할 때는 `python -m http.server` 또는 Live Server 사용
- `file://` 프로토콜로는 Firebase가 작동하지 않음

### 로그인이 안 될 때:
1. Firebase Console > Authentication에서 사용자가 제대로 생성되었는지 확인
2. firebase-config.js의 설정이 올바른지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 설교가 표시되지 않을 때:
1. Firestore 규칙이 올바르게 설정되었는지 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Firestore에 데이터가 제대로 저장되었는지 확인

## 보안 권장사항

1. **API 키 보호**: 
   - GitHub에 올릴 때 API 키를 환경변수로 관리하는 것을 권장
   - Firebase의 API 키는 공개되어도 괜찮지만, 보안 규칙으로 접근 제어

2. **관리자 계정 보호**:
   - 강력한 비밀번호 사용
   - 정기적으로 비밀번호 변경

3. **Firestore 규칙**:
   - 프로덕션에서는 항상 엄격한 규칙 사용
   - 테스트 모드는 30일 후 자동으로 비활성화됨

## 문의

문제가 발생하면 Firebase 문서를 참조하거나 개발자에게 문의하세요.
- [Firebase 문서](https://firebase.google.com/docs)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)

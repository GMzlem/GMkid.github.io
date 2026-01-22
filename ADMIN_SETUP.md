# Firestore 관리자 설정 가이드

## 🎉 더 안전한 방식으로 변경!

이제 관리자 UID가 **코드에 없어요**! 
Firestore에서 관리자를 관리합니다.

---

## 📋 설정 순서

### 1단계: Firestore에 관리자 추가

Firebase Console → Firestore Database → 데이터 탭

#### 방법 1: 직접 추가 (추천!)

```
[+ 컬렉션 시작] 클릭

┌─────────────────────────────────┐
│ 컬렉션 ID: admins              │
└─────────────────────────────────┘
[다음]

┌─────────────────────────────────┐
│ 문서 ID (UID 붙여넣기):         │
│ pelL6wwFC4hCSHagrCuiimvzbpF2    │
└─────────────────────────────────┘

필드 추가:
┌──────────┬─────────┬───────┐
│ 필드     │ 유형    │ 값    │
├──────────┼─────────┼───────┤
│ isAdmin  │ boolean │ true  │
│ email    │ string  │ (선택)│
│ name     │ string  │ (선택)│
└──────────┴─────────┴───────┘

[저장]
```

**중요!**
- 문서 ID = 사용자 UID (정확히 입력!)
- isAdmin = true (체크박스)

---

### 2단계: UID 찾는 방법

**방법 A: Firebase Console**
```
Authentication → Users 탭
→ 관리자로 만들 사용자 클릭
→ UID 복사
```

**방법 B: 로그인 후 콘솔**
```
1. 웹사이트에서 로그인
2. F12 → Console
3. 입력: auth.currentUser.uid
4. UID 복사
```

**방법 C: 임시 코드 (한 번만)**
```javascript
// auth.js 맨 아래 임시로 추가
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('내 UID:', user.uid);
    }
});

// 로그인 → 콘솔에서 UID 확인 → 복사 → 코드 삭제
```

---

### 3단계: Firestore Rules 설정

Firebase Console → Firestore Database → 규칙 탭

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // 관리자 컬렉션 (중요!)
    // ========================================
    match /admins/{userId} {
      // 로그인한 사용자는 자기 admin 상태만 읽기 가능
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // 쓰기는 금지 (Firebase Console에서만 수정)
      allow write: if false;
    }
    
    // ========================================
    // 설교 컬렉션
    // ========================================
    match /sermons/{sermonId} {
      // 누구나 읽기 가능
      allow read: if true;
      
      // 관리자만 쓰기 가능
      allow create, update, delete: if request.auth != null 
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid))
        && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

→ **"게시"** 클릭

---

## ✅ 완료 후 테스트

### 1. 웹사이트 새로고침
```
Ctrl + Shift + R
```

### 2. 관리자로 로그인
```
UID: pelL6wwFC4hCSHagrCuiimvzbpF2
→ 로그인
→ 우상단 "OOO님 [관리자]" 표시 확인
```

### 3. 관리자 페이지 접근
```
"관리자 페이지" 버튼 클릭
→ 설교 추가 가능!
```

---

## 🎯 장점

### Before (코드에 UID)
```javascript
// auth.js
const ADMIN_UIDS = ['pelL6wwFC4hCSHagrCuiimvzbpF2'];
```
- ❌ F12로 UID 노출
- ❌ 관리자 추가하려면 코드 수정 필요
- ❌ 배포 필요

### After (Firestore에 저장)
```
Firestore → admins 컬렉션
```
- ✅ 코드에 UID 없음
- ✅ Firebase Console에서 관리자 추가/제거
- ✅ 코드 수정 불필요
- ✅ 즉시 적용

---

## 📊 관리자 추가/제거

### 관리자 추가
```
Firestore → admins 컬렉션
→ [+ 문서 추가]
→ 문서 ID: 새로운_관리자_UID
→ isAdmin: true
→ [저장]
```

### 관리자 제거
```
Firestore → admins 컬렉션
→ 해당 문서 클릭
→ [삭제] 또는 isAdmin: false로 변경
```

---

## 🔒 보안 강화

### Rules 설명

**관리자 컬렉션:**
```javascript
// 자기 admin 상태만 읽기 가능
allow read: if request.auth.uid == userId;

// 쓰기 금지 (Firebase Console에서만)
allow write: if false;
```

**설교 컬렉션:**
```javascript
// 관리자 체크
exists(/databases/.../admins/$(request.auth.uid))
&& get(...).data.isAdmin == true
```

---

## 🚨 트러블슈팅

### 문제 1: "관리자" 뱃지 안 보임
```
원인: admins 컬렉션에 UID 없음
해결: 
1. Firestore → admins 확인
2. 문서 ID = 로그인한 사용자 UID
3. isAdmin = true 확인
```

### 문제 2: 설교 추가 안 됨
```
원인: Firestore Rules 설정 안 됨
해결: Rules 복사해서 붙여넣기 → 게시
```

### 문제 3: UID를 모름
```
해결:
1. 로그인
2. F12 → Console
3. auth.currentUser.uid 입력
4. UID 복사
```

---

## 📁 파일 구조

```
admins (컬렉션)
├── pelL6wwFC4hCSHagrCuiimvzbpF2 (문서)
│   ├── isAdmin: true
│   ├── email: "admin@example.com" (선택)
│   └── name: "관리자" (선택)
│
├── 다른_관리자_UID (문서)
│   └── isAdmin: true
│
└── ...

sermons (컬렉션)
├── auto_id_1 (문서)
│   ├── service: "sunday-morning"
│   ├── date: "2026.01.19"
│   └── ...
└── ...
```

---

## 💡 추가 팁

### 관리자 등급 시스템 (선택)
```javascript
// 문서 구조
{
  isAdmin: true,
  role: "super-admin",  // 또는 "moderator"
  permissions: ["sermon", "member"]
}

// Rules에서 체크
allow delete: if get(...).data.role == "super-admin";
```

### 관리자 로그 (선택)
```javascript
// 누가 무엇을 했는지 기록
adminLogs (컬렉션)
├── log_1
│   ├── adminUid: "..."
│   ├── action: "sermon_deleted"
│   ├── timestamp: ...
```

---

## 🎉 완료!

이제 더 안전하게 관리자를 관리할 수 있어요!

```
✅ 코드에 UID 없음
✅ Firebase Console에서 관리
✅ 즉시 추가/제거 가능
✅ Rules로 이중 보안
```

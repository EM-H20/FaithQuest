# FaithQuest - 새신자 등록 카드 PRD

## 1. 프로젝트 개요

목적: 직관적이고 효율적인 새신자 관리 시스템 구축
핵심가치:

- 심플하고 아름다운 UI/UX
- 효율적인 데이터 관리
- 사용자 친화적 인터페이스

## 2. 유저 플로우

1. 관리자 플로우

   - 로그인 → 대시보드 접속
   - 새신자 등록/조회/수정
   - 출석 체크 및 관리
   - 통계 확인

2. 새신자 플로우
   - 등록 폼 작성
   - 기본 정보 입력
   - 제출 및 확인

## 3. 와이어프레임 & 핵심 기능

### 메인 대시보드

```
+------------------+
|     헤더         |
+------------------+
| [새신자 등록]    |
| [출석 관리]      |
| [통계 보기]      |
+------------------+
|    최근 등록     |
|    새신자 목록   |
+------------------+
```

### 새신자 등록 카드

```
+------------------+
| ○ 새신자 정보    |
|  이름: _______   |
|  연락처: ______ |
|  생년월일: ____ |
|  직분: [선택▼]   |
+------------------+
```

### 출석 관리

```
+------------------+
| 월간 출석부      |
|  [  ] [  ] [  ]  |
|  [  ] [  ] [  ]  |
+------------------+
```

## 4. 기술 스택

1. 기본 기술

   - HTML5
   - CSS3
   - Vanilla JavaScript

2. 라이브러리

   - Chart.js (통계 시각화)
   - FontAwesome (아이콘)
   - Flatpickr (달력)

3. 데이터 관리
   - LocalStorage
   - JSON 데이터 구조

## 5. 디자인 스펙

### 색상 코드

```css
/* 직분별 색상 */
.role-pastor { color: #4A90E2; }
.role-elder { color: #7ED321; }
.role-deacon { color: #F5A623; }

/* 기본 테마 */
.primary: #2C3E50
.secondary: #ECF0F1
.accent: #3498DB
```

### 타이포그래피

```css
font-family: 'Noto Sans KR', sans-serif;
heading: 24px
body: 16px
small: 14px
```

## 6. MVP 핵심 기능

1. Phase 1 (필수)

   - 새신자 정보 등록
   - 기본 출석 체크
   - 직분별 구분 표시
   - 데이터 저장/조회

2. Phase 2 (우선순위)
   - 간단한 통계
   - 검색 기능(출석관리:attendance.html에 기능추가함)
   - 데이터 내보내기

## 7. 추가 개선사항

1. 기능 확장

   - 백엔드 연동
   - 자동 알림 시스템
   - 상세 통계 기능

2. UI/UX 개선

   - 다크 모드
   - 반응형 최적화
   - 접근성 향상

3. 데이터 관리
   - 백업 시스템
   - 데이터 마이그레이션
   - 보안 강화

## 8. 개발 일정

1주차: UI 구현
2주차: 기본 기능 구현
3주차: 데이터 관리
4주차: 테스트 및 수정

이 PRD를 바탕으로 순차적 개발을 진행하며, 사용자 피드백에 따라 지속적으로 개선할 수 있습니다.
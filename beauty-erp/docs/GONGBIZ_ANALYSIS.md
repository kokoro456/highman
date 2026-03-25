# 공비서 (GongBiz) 종합 분석 보고서

> **분석일**: 2026-03-25
> **분석 대상**: 공비서 원장님 앱 (v8.12.15, `com.gongnailshop.herren_dell1.gongnailshop`) + 공비서 B2C 앱 (v1.7.4, `com.herren.gongb2c`)
> **분석 소스**: XAPK 디컴파일 데이터, 공식 웹사이트 (home.ahasoft.co.kr), API mock 데이터
> **목적**: Beauty ERP 개발을 위한 경쟁 제품 벤치마킹

---

## 1. 제품 개요

### 1.1 앱 구성
| 앱 | 패키지명 | 버전 | 대상 |
|---|---|---|---|
| **공비서 원장님** (B2B) | `com.gongnailshop.herren_dell1.gongnailshop` | 8.12.15 (build 2169) | 매장 관리자/직원 |
| **공비서** (B2C) | `com.herren.gongb2c` | 1.7.4 (build 116) | 고객 |

### 1.2 지원 업종 카테고리
XAPK 분석에서 확인된 업종:
- 네일 (NAIL)
- 헤어 (HAIR)
- 반영구 (SEMI_PERMANENT)
- 속눈썹 (EYELASHES)
- 왁싱 (WAXING)
- 피부관리 (SKINCARE)
- 바버 (BARBER)
- 태닝 (TANNING)
- 두피/탈모관리 (SCALP)
- 메이크업 (MAKEUP)
- 마사지 (MASSAGE)
- 타투 (TATTOO)

### 1.3 다국어 지원
Split config에서 확인된 지원 언어: ko, en, ja, zh, vi, th, fr, de, es, pt, it, ar, hi, my, ru, tr, in

---

## 2. 전체 메뉴 트리 (B2B 원장님 앱)

```
공비서 원장님 (B2B)
│
├── 홈 (Home)
│   ├── 예약 캘린더 (Reservation Calendar)
│   │   ├── 월간/주간/일간 뷰 토글 (Month/Week/Day View Toggle)
│   │   ├── 직원별 필터 드롭다운 (Staff Filter Dropdown)
│   │   ├── Today 버튼 (Today Quick Navigation)
│   │   └── FAB 버튼 (+) 신규 예약 등록 (Floating Action Button for New Booking)
│   └── 샵 현황 (Shop Status Dashboard)
│       ├── 오늘 예약 건수 (Today's Bookings Count)
│       ├── 오늘 매출 (Today's Revenue)
│       └── 대기/진행중/완료 현황 (Status: Waiting/In Progress/Completed)
│
├── 매출 (Sales)
│   ├── 매출목록 (Sales List) [Tab 1]
│   │   ├── 날짜 범위 필터 (Date Range Filter)
│   │   │   └── 빠른 선택: 오늘/어제/3일/7일/15일/1개월 (Quick Presets)
│   │   ├── 결제수단별 필터 (Payment Method Filter)
│   │   ├── 직원별 필터 (Staff Filter)
│   │   ├── 매출 테이블 (Sales Table)
│   │   │   └── 컬럼: 날짜, 고객명, 시술내용, 담당자, 결제금액, 결제수단, 상태
│   │   └── 페이지네이션 (Pagination)
│   ├── 미등록매출 (Unregistered Sales) [Tab 2]
│   │   └── 네이버예약 등 외부 결제 중 미등록 건 관리
│   ├── 미수금매출 (Unpaid/Receivable Sales) [Tab 3]
│   │   └── 미수금 목록 및 수금 처리
│   ├── 매출 통계 보기 (View Sales Statistics)
│   │   └── 통계 페이지로 이동 링크
│   └── 매출 목록 다운로드 (Download Sales List)
│       └── Excel/CSV 내보내기
│
├── 고객 (Customer)
│   ├── 고객차트 (Customer Chart/Profile)
│   │   ├── 고객 검색 (Customer Search)
│   │   ├── 고객 목록 테이블 (Customer List Table)
│   │   │   └── 컬럼: 이름, 연락처, 최근방문일, 방문횟수, 등급, 메모
│   │   ├── 고객 상세 프로필 (Customer Detail Profile)
│   │   │   ├── 기본 정보 (Name, Phone, Birth, Gender)
│   │   │   ├── 시술 이력 타임라인 (Procedure History Timeline)
│   │   │   ├── 시술 사진 갤러리 (Procedure Photo Gallery)
│   │   │   ├── 메모/특이사항 (Notes/Special Requirements)
│   │   │   └── 동의서 관리 (Consent Form Management)
│   │   └── 고객 등록/수정 모달 (Customer Create/Edit Modal)
│   └── 회원권/포인트 관리 (Membership/Points Management)
│       ├── 금액권 (Amount-based Card) - 충전식 선불 카드
│       ├── 할인권 (Discount Card) - 할인율 적용 카드
│       ├── 횟수권 (Visit Pass) - 횟수 기반 이용권
│       ├── 포인트 (Points) - 적립/사용 포인트
│       └── 가족 회원권 (Family Membership) - 가족 공유 회원권
│
├── 마케팅 (Marketing)
│   ├── 문자/단체문자 전송 (SMS / Bulk SMS)
│   │   ├── 수신자 선택 (고객 필터링) (Recipient Selection)
│   │   ├── 메시지 템플릿 (Message Templates)
│   │   └── 예약 발송 (Scheduled Send)
│   ├── 알림톡/자동 문자 (KakaoTalk Alimtok / Auto SMS)
│   │   ├── 예약 확인 알림 (Booking Confirmation)
│   │   ├── 예약 리마인더 (Booking Reminder)
│   │   ├── 방문 감사 알림 (Visit Thank You)
│   │   └── 재방문 유도 알림 (Revisit Encouragement)
│   ├── 시술 후 알림 (Post-Procedure Notification)
│   │   └── 시술별 맞춤 후속 관리 안내
│   ├── 전송 내역 (Send History)
│   │   └── 발송 목록, 성공/실패 상태
│   └── 체험단 모집 (Experience Group Recruitment)
│       └── 체험단 이벤트 생성 및 관리
│
├── 통계 (Statistics)
│   ├── 통계 대시보드 (Statistics Dashboard)
│   │   ├── 실매출합계 (Total Net Revenue) - Card KPI
│   │   ├── 객단가 (Average Transaction Value) - Card KPI
│   │   ├── 총예약건수 (Total Bookings) - Card KPI
│   │   ├── 시간활용비율 (Time Utilization Rate) - Card KPI
│   │   └── 재방문고객비율 (Returning Customer Rate) - Card KPI
│   ├── 상품별 통계 (Product/Service Statistics)
│   │   ├── 일별 매출내역 (Daily Revenue)
│   │   ├── 주별 매출내역 (Weekly Revenue)
│   │   └── 월별 매출내역 (Monthly Revenue)
│   ├── 결제 수단별 통계 (Payment Method Statistics)
│   │   ├── 현금 (Cash)
│   │   ├── 카드 (Card)
│   │   ├── 네이버페이 (Naver Pay)
│   │   ├── 정액권 (Subscription/Fixed Amount)
│   │   ├── 티켓 (Ticket)
│   │   └── 포인트 (Points)
│   └── 시술 통계 (Procedure Statistics)
│       ├── 시술 메뉴별 (By Procedure Menu)
│       └── 시술 그룹별 (By Procedure Group)
│
├── 우리샵 관리 (Shop Management)
│   ├── 매장 정보 (Shop Information)
│   │   ├── 매장명, 주소, 연락처 (Name, Address, Contact)
│   │   ├── 매장 소개 (Introduction)
│   │   ├── 매장 이미지 관리 (Shop Images - up to 10)
│   │   ├── 업종 카테고리 설정 (Business Category)
│   │   └── 태그 설정 (Tags: 무료주차, 심야영업, 1:1 책임시술 등)
│   ├── 직원 관리 (Staff Management)
│   │   ├── 직원 등록/수정 (Staff Create/Edit)
│   │   ├── 직원별 근무 스케줄 (Staff Schedule)
│   │   ├── 직급 관리 (원장/부원장/매니저 등) (Grade Management)
│   │   └── 인센티브 설정 (Incentive Configuration)
│   │       └── 직원별/매출 구간별 차등 인센티브율
│   ├── 시술 메뉴 관리 (Service Menu Management)
│   │   ├── 카테고리별 시술 그룹 (Category > Group > Item)
│   │   ├── 시술별 가격/B2C가격/소요시간/이미지 설정
│   │   ├── 대표 시술 지정 (Signature Procedure Flag)
│   │   └── B2C 연동 여부 (isLinkedB2c)
│   ├── 영업시간 설정 (Business Hours)
│   │   ├── 요일별 영업시간 (Weekly Schedule)
│   │   ├── 휴식시간 (Break Time)
│   │   ├── 정기 휴무일 (Regular Holidays)
│   │   └── 당일예약 설정 (Same-day Booking Option: 3시간 전 등)
│   └── 예약 설정 (Booking Settings)
│       ├── 예약 시간 간격 (Booking Time Interval: 30분)
│       ├── 노쇼 방지 (No-show Prevention)
│       ├── 중복 예약 방지 (Duplicate Booking Prevention)
│       └── 예약금 설정 (Deposit Settings)
│
├── 온라인 예약 (Online Booking)
│   ├── B2C 예약 페이지 설정 (B2C Booking Page Settings)
│   │   ├── 매장 소개 페이지 커스터마이징
│   │   ├── 시술 메뉴 노출 설정
│   │   └── 예약 가능 시간 설정
│   ├── 네이버 예약 연동 (Naver Booking Integration)
│   │   └── 네이버 예약과 양방향 동기화
│   └── 제로샵 (Zero Shop) 설정
│       └── 공비서 B2C 앱 내 매장 노출 관리
│
├── 고객센터 (Customer Support)
│   ├── 사용법 안내 (Usage Guide)
│   ├── 공지사항 (Announcements)
│   └── 문의하기 (Contact/Inquiry)
│
└── 사이드바 하단
    └── 프로모션 배너 (Rotating Promo Banners)
```

---

## 3. 전체 메뉴 트리 (B2C 고객 앱)

```
공비서 (B2C)
│
├── 홈 (Home/Main)
│   ├── 메인 배너 (Main Banner Carousel)
│   ├── 큐레이션 블록 (Curation Blocks)
│   │   ├── 가로 스크롤 샵 추천 (Horizontal Shop Recommendations)
│   │   │   예: "트렌드를 선점할 시간! 먼저 만나는 봄맞이 네일"
│   │   │   예: "당일 예약, 늦은 시간도 문제 없어요!"
│   │   └── 세로 그리드 시술 추천 (Vertical Procedure Grid - COK)
│   │       예: "요즘 인기 있는 시술"
│   └── 매거진 (Magazine Content)
│       └── 좋아요 기능 (Toggle Like)
│
├── 검색 (Search)
│   ├── 키워드 검색 (Keyword Search)
│   ├── 추천 검색어 (Recommended Search Terms)
│   ├── 위치 기반 검색 (Location-based Search)
│   └── 제로샵 필터 (Zero Shop Filter - isZeroShop)
│
├── 샵 상세 (Shop Detail)
│   ├── 매장 이미지 갤러리 (Shop Image Gallery)
│   ├── 매장 정보 (Shop Info: 주소, 연락처, 영업시간)
│   ├── 시술 메뉴 (Procedure Menu)
│   │   └── 카테고리 > 종류(kind) > 시술 목록
│   │       └── 항목: 이름, 설명, 가격, 회원가, 소요시간, 대표시술 표시
│   ├── 리뷰 (Reviews)
│   │   ├── 별점 평균 (Rating Average)
│   │   ├── 만족도 분포 (BEST/GOOD/BAD)
│   │   ├── 포토 리뷰 필터 (Image Review Filter)
│   │   └── 리뷰 작성/수정 (Review Write/Edit)
│   ├── 소식 (Shop News)
│   └── 태그 표시 (무료주차, 심야영업, 1:1 책임시술 등)
│
├── 예약 (Booking)
│   ├── 시술 선택 (Procedure Selection)
│   ├── 직원 선택 (Staff Selection - 원장/부원장/매니저)
│   ├── 날짜/시간 선택 (Date/Time Selection)
│   ├── 예약금 결제 (Deposit Payment - if required)
│   ├── 쿠폰 적용 (Coupon Application)
│   │   └── 쿠폰 유형: ALL_SHOP / SPECIFIC_SHOP
│   └── 예약 확인 (Booking Confirmation)
│       └── 상태: READY → SCHEDULED → BOOKING → BOOKING_CANCEL / COMPLETED
│
├── 내 예약 (My Bookings)
│   ├── 예정된 예약 (Scheduled - filter=SCHEDULED)
│   ├── 완료된 예약 (Completed - filter=COMPLETED)
│   ├── 예약 상세 (Booking Detail)
│   │   └── 샵 정보, 시술 내용, 담당자, 시간, 상태
│   └── 최근 방문 (Latest Visit)
│
├── 쿠폰함 (My Coupons)
│   ├── 사용 가능 쿠폰 (Available Coupons)
│   │   └── 예: 첫 예약 2,000원 할인, 웰컴 5,000원, 리뷰 작성 감사, 생일 축하
│   └── 사용 완료/만료 쿠폰 (Used/Expired)
│
├── 알림 (Notifications / App Push)
│   ├── 알림 목록 (Notification List - paginated)
│   ├── 읽음 처리 (Mark as Read)
│   ├── 미읽음 카운트 (Unread Count)
│   └── 알림 설정 (Push Settings)
│
├── 마이페이지 (My Page)
│   ├── 프로필 관리 (Profile Management)
│   ├── 배너 (My Page Banner)
│   └── COK 시술 좋아요 (Liked Procedures)
│
└── 이미지 업로드 (Image Upload)
    └── S3 Presigned URL 방식
```

---

## 4. 주요 페이지별 상세 분석

### 4.1 홈 - 예약 캘린더 (Reservation Calendar)

#### Content Layout & UI Components
- **캘린더 뷰 토글**: 상단에 월간(Month)/주간(Week)/일간(Day) 뷰 전환 버튼
- **직원 필터**: 드롭다운으로 특정 직원의 예약만 필터링
- **Today 버튼**: 오늘 날짜로 즉시 이동하는 퀵 네비게이션
- **FAB 버튼 (+)**: 화면 우하단 플로팅 액션 버튼으로 신규 예약 즉시 등록
- **예약 블록**: 시간대별 컬러 블록으로 예약 표시, 클릭 시 상세/결제로 이동
- **드래그 앤 드롭**: 예약 시간 변경 (일간 뷰에서)

#### Key Features
- 원클릭 예약 → 결제 처리 플로우
- 매장 휴무일/블랙아웃 날짜 설정
- 노쇼 방지 시스템
- 중복 예약 자동 방지
- 메모 입력 기능

#### Design Patterns
- 캘린더 영역: 화이트 배경, 시간 그리드라인은 연한 회색
- 예약 블록: 직원별 또는 상태별 색상 구분
- 일간 뷰: 세로 타임라인 형태, 30분 단위 그리드

#### 구현 접근법 (Beauty ERP)
- FullCalendar 또는 커스텀 캘린더 컴포넌트 사용
- 일간 뷰에서 직원별 컬럼 레이아웃 (공비서의 핵심 강점)
- React DnD로 드래그 앤 드롭 예약 이동
- WebSocket으로 실시간 예약 업데이트

---

### 4.2 매출 (Sales)

#### Content Layout & UI Components
- **3개 탭 구성**: 매출목록 / 미등록매출 / 미수금매출
- **날짜 범위 필터**: 빠른 선택 버튼 (오늘/어제/3일/7일/15일/1개월) + 커스텀 날짜 선택
- **매출 테이블**: 깔끔한 테이블 레이아웃, 페이지네이션
- **매출 통계 보기 링크**: 통계 페이지로 이동
- **다운로드 버튼**: Excel/CSV 매출 데이터 내보내기

#### Key Features
- 날짜/직원/결제수단별 필터링
- 미등록 매출 관리 (네이버 예약 등 외부 결제)
- 미수금 추적 및 수금 처리
- Excel 다운로드 기능
- 결제 수단: 현금 / 카드 / 네이버페이 / 정액권 / 티켓 / 포인트

#### Design Patterns
- 탭 네비게이션: 상단 수평 탭, 활성 탭 하단 파란색 밑줄
- 필터 영역: 회색 배경 박스에 날짜 범위 버튼 그룹
- 테이블: 흰색 배경, 얇은 구분선, hover시 연한 파란색 배경
- 금액 표시: 우측 정렬, 천단위 콤마

#### 구현 접근법 (Beauty ERP)
- Tab 컴포넌트: Radix UI Tabs 활용
- 날짜 범위 필터: date-fns + 커스텀 DateRangePicker
- 테이블: TanStack Table (가상 스크롤, 정렬, 필터)
- Excel 내보내기: xlsx 라이브러리 사용 (이미 구현 완료)

---

### 4.3 고객 - 고객차트 (Customer Chart)

#### Content Layout & UI Components
- **검색바**: 고객명/연락처로 검색
- **고객 목록**: 테이블 형태, 이름/연락처/최근방문/방문횟수/등급/메모
- **고객 상세 슬라이드 패널**: 목록에서 클릭시 우측에 상세 패널 표시
  - 기본 정보 카드
  - 시술 이력 타임라인
  - 시술 사진 갤러리 (Before/After)
  - 동의서 관리 (시술 동의서 - digital consent)
  - 메모/특이사항

#### Key Features
- 고객 차트(프로필) 중심의 고객 관리 - CRM 개념
- 시술 사진 저장 및 조회 (Before/After 비교)
- 디지털 시술 동의서 관리
- 고객 태그/메모 시스템
- 회원권/포인트 잔액 조회

#### Design Patterns
- 마스터-디테일(Master-Detail) 레이아웃
- 고객 프로필 카드: 둥근 아바타, 등급 뱃지
- 사진 갤러리: 그리드 썸네일, 라이트박스 확대

#### 구현 접근법 (Beauty ERP)
- 고객 상세를 슬라이드 오버 패널로 구현 (Sheet 컴포넌트)
- 사진 업로드: S3 Presigned URL (공비서와 동일 방식)
- 동의서: PDF 템플릿 + 디지털 서명 캔버스

---

### 4.4 고객 - 회원권/포인트 관리 (Membership/Points)

#### Content Layout & UI Components
- **회원권 유형 탭**: 금액권/할인권/횟수권/포인트/가족회원권
- **회원권 발급 내역 테이블**
- **잔여/사용 현황 요약 카드**
- **충전/차감 모달**

#### Key Features (XAPK 분석 기반)
- **금액권**: 선불 충전 후 잔액 차감 방식
- **할인권**: 특정 할인율 적용 카드
- **횟수권**: N회 이용권 (회당 차감)
- **포인트**: 시술 금액의 N% 적립, 포인트 사용
- **가족 회원권**: 가족 구성원 간 공유 가능

#### 구현 접근법 (Beauty ERP)
- 현재 Beauty ERP에는 회원권 시스템이 미구현 - **핵심 추가 필요 기능**
- `membership` 테이블: type(AMOUNT/DISCOUNT/COUNT/POINT), balance, expiryDate
- `membershipTransaction` 테이블: charge/deduct 이력 관리

---

### 4.5 마케팅 (Marketing)

#### Content Layout & UI Components
- **문자 발송**: 수신자 필터 (전체/조건별), 메시지 편집기, 발송 예약
- **알림톡 설정**: 자동 발송 조건 설정 (예약확인/리마인더/방문감사/재방문유도)
- **시술 후 알림**: 시술별 후속 관리 안내 자동 발송
- **전송 내역**: 발송 목록, 성공/실패 건수 표시
- **체험단 모집**: 이벤트 생성, 모집 현황, 당첨자 관리

#### Key Features
- SMS/LMS 대량 발송
- 카카오 알림톡 자동 발송 연동
- 시술 후 케어 안내 자동화
- 체험단 마케팅 기능
- 발송 내역 및 성과 추적

#### Design Patterns
- 폼 기반 레이아웃: 단계별 설정 (수신자 선택 → 메시지 작성 → 발송)
- 전송 내역: 테이블 + 성공/실패 배지 표시
- 알림 설정: 토글 스위치 + 조건부 설정 폼

#### 구현 접근법 (Beauty ERP)
- 카카오 알림톡: Kakao Alimtalk API 연동 (이미 설계에 포함)
- SMS: NHN Cloud SMS API 또는 카카오 비즈메시지
- 체험단: 별도 마케팅 모듈로 구현

---

### 4.6 통계 (Statistics)

#### Content Layout & UI Components
- **KPI 카드 그리드**: 상단에 5개 핵심 지표 카드 배치
  - 실매출합계: 큰 숫자 + 전기 대비 증감율 (화살표 + %)
  - 객단가: 평균 결제 금액
  - 총예약건수: 예약 수
  - 시간활용비율: 영업시간 대비 시술시간 비율
  - 재방문고객비율: 재방문 고객 수 / 전체 고객 수
- **날짜 범위 필터**: 빠른 선택 + 커스텀 날짜
- **차트 영역**: 라인 차트(매출 추이), 바 차트(상품별/시간대별), 파이 차트(결제수단별)
- **상세 테이블**: 차트 하단에 상세 데이터 테이블

#### Key Features
- 실시간 매출 통계 대시보드
- 상품(시술)별 매출 분석 (일/주/월)
- 결제 수단별 비중 분석
- 시술 메뉴별/그룹별 인기도 분석
- 시간활용비율 - 매장 효율성 지표
- 재방문율 - 고객 충성도 지표

#### Design Patterns
- **카드 KPI**: 흰색 카드, 큰 숫자 (32px+), 하단에 증감율 표시
- **차트**: 깔끔한 라인/바 차트, 파란색(#4d7cfe) 계열 색상
- **기간 비교**: 이전 기간 대비 증감을 화살표와 퍼센트로 표시
- **그리드 레이아웃**: 2x3 또는 3x2 카드 그리드

#### 구현 접근법 (Beauty ERP)
- 차트: Recharts 또는 Chart.js (현재 CSS 기반 차트 → 라이브러리로 업그레이드 고려)
- KPI 카드: 커스텀 StatsCard 컴포넌트
- 시간활용비율/재방문율은 **공비서 고유 기능** - 반드시 구현 필요

---

### 4.7 우리샵 관리 (Shop Management)

#### Content Layout & UI Components
- **매장 정보 폼**: 매장명, 주소(우편번호 검색), 연락처, 소개글
- **이미지 관리**: 드래그 앤 드롭 이미지 업로더 (최대 10장)
- **영업시간 설정**: 요일별 시작/종료 시간 + 휴무일 토글
- **휴식시간**: 점심시간 등 브레이크 타임 설정
- **직원 카드**: 직원 프로필 카드 그리드
- **시술 메뉴**: 카테고리 > 그룹 > 아이템 3단계 트리 구조
- **인센티브**: 직원별/매출구간별 차등 인센티브율 설정

#### Key Features (XAPK CosmeticTempData.json 분석 기반)
- 시술 메뉴 3단계 구조:
  - **Category** (업종): NAIL, HAIR, SEMI_PERMANENT, EYELASHES 등
  - **Group** (시술 그룹): 손, 발, 남성, 여성, 아이라인, 눈썹 등
  - **Item** (시술 항목): 각 시술별 가격(price), B2C 가격(b2cPrice), 소요시간(procTime), 이미지, B2C 연동 여부
- 요일별 영업시간 설정 (XAPK shopBusinessSchedule 기반):
  - 요일별 개별 시작/종료 시간
  - 요일별 휴무일 설정
  - 브레이크 타임 (breakStartTime/breakEndTime)
- 당일예약 옵션: BEFORE_3H (3시간 전까지), 기타 옵션
- 매장 태그: 무료주차, 심야영업, 1:1 책임시술, 반려견동반가능, 리클라이너소파, 동시시술

#### Design Patterns
- 폼 섹션: 카드 단위로 구분, 섹션 타이틀 + 구분선
- 시간 설정: 시작/종료 시간 드롭다운 (30분 단위)
- 이미지: 썸네일 그리드 + 드래그 정렬

#### 구현 접근법 (Beauty ERP)
- 시술 메뉴 3단계 구조 반영 필요 (현재 2단계로 추정)
- price vs b2cPrice 분리: 내부 관리 가격과 고객 공개 가격 분리
- 매장 태그 시스템: 미리 정의된 태그 + 커스텀 태그

---

### 4.8 온라인 예약 (Online Booking)

#### Content Layout & UI Components
- **B2C 예약 페이지 설정**: 매장 소개, 시술 메뉴 노출 설정
- **네이버 예약 연동**: 네이버 스마트플레이스와 양방향 동기화
  - XAPK `reservation_sync.json`: 예약 동기화 프로토콜 데이터
  - XAPK `naver_payment_request.json`: 네이버 결제 요청 형식
- **제로샵 설정**: 공비서 B2C 앱 내 매장 노출 관리

#### Key Features
- B2C 예약 페이지 자동 생성 (매장별 고유 URL)
- 네이버 예약 실시간 동기화
- 네이버페이 결제 연동
- 예약금 설정 (유/무, 금액)
- 확정 방식 설정 (즉시확정 / 확인 후 확정)

#### 구현 접근법 (Beauty ERP)
- 네이버 예약 연동은 이미 Beauty ERP 설계에 포함
- 예약 확정 방식 옵션 추가 필요: AUTO_CONFIRM vs MANUAL_CONFIRM
- 예약금 결제: 토스페이먼츠 연동 (이미 설계에 포함)

---

### 4.9 고객센터 (Customer Support)

#### Content Layout & UI Components
- **사용법 안내**: FAQ/가이드 문서 목록
- **공지사항**: 공지 목록 + 상세
- **문의하기**: 1:1 문의 폼 또는 채팅

#### Design Patterns
- 아코디언 FAQ
- 공지 목록: 날짜순 정렬, 중요 공지 고정

---

## 5. 디자인 분석

### 5.1 Color Palette

| 용도 | 색상 | Hex | 비고 |
|------|------|-----|------|
| **사이드바 배경** | Dark Navy | `#1a1f36` | 좌측 고정 사이드바 |
| **사이드바 텍스트 (비활성)** | Muted Gray | `#8b8fa3` | |
| **사이드바 텍스트 (활성)** | White | `#ffffff` | 활성 메뉴 강조 |
| **메인 배경** | White | `#ffffff` | 콘텐츠 영역 |
| **서브 배경** | Light Gray | `#f7f8fc` | 필터 영역, 카드 배경 |
| **Primary / Accent** | Blue | `#4d7cfe` | 버튼, 링크, 활성 탭 |
| **Primary Hover** | Dark Blue | `#3a6aed` | 호버 상태 |
| **Success** | Green | `#27ae60` | 확정, 완료 상태 |
| **Warning** | Orange | `#f39c12` | 대기, 진행중 |
| **Danger** | Red | `#e74c3c` | 취소, 에러 |
| **텍스트 Primary** | Dark Gray | `#2d3436` | 본문 텍스트 |
| **텍스트 Secondary** | Medium Gray | `#636e72` | 보조 텍스트 |
| **Border** | Light Gray | `#e8eaf0` | 테이블, 카드 테두리 |

### 5.2 Typography
- **한글 폰트**: 시스템 sans-serif (Pretendard 또는 Noto Sans KR 계열)
- **숫자/영문**: 시스템 sans-serif
- **크기 체계**:
  - 페이지 타이틀: 24px, font-weight 700
  - 섹션 타이틀: 18px, font-weight 600
  - 본문: 14px, font-weight 400
  - 보조 텍스트: 12px, font-weight 400
  - KPI 숫자: 32-40px, font-weight 700

### 5.3 Layout System
- **사이드바**: 좌측 고정, 너비 190px, Dark Navy 배경
  - 상단: 로고/매장명
  - 중앙: 메인 메뉴 아이콘 + 텍스트
  - 하단: 프로모션 배너 (회전)
- **헤더 바**: 상단 고정, 높이 56px, 흰색 배경
  - 좌측: 현재 페이지 타이틀
  - 우측: 알림 벨, 설정, 프로필
- **메인 콘텐츠**: 사이드바 우측, 헤더 하단 영역
  - padding: 24px
  - max-width: 제한 없음 (유동적)

### 5.4 주요 UI Components

#### Date Range Filter (날짜 범위 필터)
```
[오늘] [어제] [3일] [7일] [15일] [1개월]  [2024.03.01 ~ 2024.03.25 📅]
```
- 빠른 선택 버튼: pill 형태, 선택시 파란색 배경
- 커스텀 범위: DatePicker 팝오버

#### Pagination (페이지네이션)
```
< 1 2 3 4 5 ... 10 >
```
- 심플한 숫자 페이지네이션
- 현재 페이지: 파란색 배경 원형

#### Table (테이블)
- 헤더: 연한 회색 배경 (#f7f8fc), font-weight 600
- 행: 흰색 배경, hover시 연한 파란색 (#f0f4ff)
- 구분선: 하단 1px solid #e8eaf0
- 정렬: 숫자/금액 우측 정렬, 텍스트 좌측 정렬

#### Card Grid (카드 그리드 - 통계용)
- 카드: 흰색 배경, border-radius 12px, subtle shadow
- 그리드: 2열 또는 3열, gap 16px
- KPI 카드 구조:
  ```
  ┌─────────────────────┐
  │ 📊 실매출합계        │
  │                     │
  │ ₩3,450,000         │
  │ ▲ 12.5% vs 전월    │
  └─────────────────────┘
  ```

#### FAB Button (플로팅 액션 버튼)
- 위치: 우하단 고정
- 크기: 56px 원형
- 색상: Primary Blue (#4d7cfe)
- 아이콘: + (plus)
- shadow: 0 4px 12px rgba(77, 124, 254, 0.3)

#### Calendar View Toggles
```
[월] [주] [일]     [< 2024년 3월 >]     [Today]
```
- 토글 버튼 그룹: 좌측
- 날짜 네비게이션: 중앙
- Today 버튼: 우측

#### Staff Filter Dropdown
```
[전체 직원 ▼]
├── 전체
├── 김원장 (원장)
├── 이부원장 (부원장)
└── 박매니저 (매니저)
```

#### Promo Banner (사이드바 하단)
- 위치: 사이드바 최하단
- 크기: 사이드바 너비에 맞춤
- 형태: 이미지 배너, 자동 회전 (carousel)
- 내용: 신기능 안내, 프로모션, 이벤트

---

## 6. API 구조 분석 (XAPK 기반)

### 6.1 B2B (원장님 앱) API Endpoints 추정

| Domain | Endpoint Pattern | 비고 |
|--------|-----------------|------|
| Auth | `/api/auth/login`, `/api/auth/register` | JWT 기반 |
| Shop | `/api/shop/{shopId}` | 매장 정보 CRUD |
| Staff | `/api/staff/{staffId}` | 직원 관리 |
| Booking | `/api/booking/{bookingId}` | 예약 CRUD |
| Customer | `/api/customer/{customerId}` | 고객 관리 |
| Sales | `/api/sales/`, `/api/sales/stats` | 매출 관리 |
| Payment | `/api/payment/` | 결제 처리 |
| Procedure | `/api/procedure/` | 시술 메뉴 |
| Marketing | `/api/marketing/sms`, `/api/marketing/alimtalk` | 마케팅 |
| Statistics | `/api/statistics/dashboard` | 통계 |
| Image | S3 Presigned URL | 이미지 업로드 |

### 6.2 B2C API Endpoints (XAPK 확인)

| Domain | Endpoint | 비고 |
|--------|----------|------|
| Main | `GET /api/v1/main` | 메인 페이지 큐레이션 블록 |
| Banner | `GET /api/v1/banner/{page}` | 배너 (main, my_page) |
| Shop | `GET /api/v1/shop/{shopId}` | 매장 상세 |
| Shop Menu | `GET /api/v1/shop/menu/{shopId}` | 시술 메뉴 |
| Search | `GET /api/v1/search/shop/keyword` | 키워드 검색 |
| Search | `POST /api/v1/search/shop/location` | 위치 기반 검색 |
| Booking | `GET /api/v1/booking` | 내 예약 목록 |
| Booking | `GET /api/v1/booking/detail/{id}` | 예약 상세 |
| Booking | `GET /api/v1/booking/latest-visit` | 최근 방문 |
| Review | `GET /api/v1/review/shopId={id}` | 매장 리뷰 요약 |
| Review | `GET /api/v1/review/detail` | 리뷰 상세 목록 |
| Review | `PATCH /api/v1/review/{id}` | 리뷰 수정 |
| Coupon | `GET /api/v1/coupon` | 내 쿠폰 목록 |
| Coupon | `GET /api/v1/payment/coupon` | 결제 시 쿠폰 조회 |
| Notification | `GET /api/v1/notification/app-push` | 알림 목록 |
| Notification | `PATCH /api/v1/notification/app-push/read` | 읽음 처리 |
| Magazine | `GET /api/v1/magazine` | 매거진 목록 |
| COK | `GET /api/v1/cok` | COK 시술 컬렉션 |
| COK | `GET /api/v1/cok-procedure` | COK 시술 검색 |
| Curation | `GET /api/v1/curation/{id}` | 큐레이션 상세 |
| Image | `GET /api/v1/image/upload` | S3 Presigned URL |
| Auth | `POST /api/v1/phone/auth/code` | 휴대폰 인증 |

### 6.3 데이터 모델 특징

#### 시술 메뉴 구조 (3단계 트리)
```
Category (업종)
  └── Group (시술 그룹)
       └── Item (시술 항목)
            ├── price: 내부 관리 가격
            ├── b2cPrice: 고객 공개 가격
            ├── procTime: 소요시간 ("0130" = 1시간 30분)
            ├── isLinkedB2c: B2C 노출 여부
            ├── isRepresentative: 대표 시술 여부
            └── imageUrl: 시술 이미지
```

#### 예약 상태 머신
```
READY → SCHEDULED → BOOKING → COMPLETED
                  ↘ BOOKING_CANCEL
```

#### 리뷰 만족도 레벨
```
BEST (최고) / GOOD (좋아요) / BAD (별로예요)
```

#### 쿠폰 타겟 유형
```
ALL_SHOP (전체 매장) / SPECIFIC_SHOP (특정 매장)
```

---

## 7. Beauty ERP와의 비교 분석

### 7.1 기능 비교표

| 기능 | 공비서 | Beauty ERP | 우선순위 |
|------|--------|-----------|----------|
| 예약 캘린더 (월/주/일) | O | O | - |
| FAB 버튼 신규 예약 | O | △ (모달) | Medium |
| 직원별 캘린더 필터 | O | O | - |
| **회원권 관리 (금액/할인/횟수/포인트)** | O | X | **HIGH** |
| **가족 회원권** | O | X | **HIGH** |
| 고객 시술 사진 관리 | O | O | - |
| **디지털 시술 동의서** | O | X | **HIGH** |
| **예약금(보증금) 관리** | O | X | **HIGH** |
| 미등록매출 관리 | O | △ (일부) | Medium |
| 미수금매출 추적 | O | △ (일부) | Medium |
| 매출 Excel 다운로드 | O | O | - |
| SMS/LMS 대량 발송 | O | △ (알림톡만) | Medium |
| **카카오 알림톡 자동 발송** | O | O (설계) | - |
| **시술 후 자동 알림** | O | X | **HIGH** |
| **체험단 모집** | O | X | Low |
| 통계 대시보드 | O | O | - |
| **시간활용비율 통계** | O | X | **HIGH** |
| **재방문고객비율 통계** | O | X | **HIGH** |
| 결제수단별 통계 | O | O | - |
| 시술 메뉴별/그룹별 통계 | O | △ | Medium |
| 네이버 예약 연동 | O | O (설계) | - |
| **네이버페이 결제** | O | X | **HIGH** |
| **노쇼 방지 시스템** | O | X | **HIGH** |
| **중복 예약 방지** | O | △ | Medium |
| 직원 인센티브 자동 계산 | O | O | - |
| **매장 태그 시스템** | O | X | Medium |
| **B2C 앱 (고객용)** | O (별도 앱) | O (웹) | - |
| 매장 큐레이션/추천 | O | X | Low |
| 매거진 콘텐츠 | O | X | Low |
| COK 시술 컬렉션 | O | X | Low |
| 쿠폰 시스템 | O | O | - |
| 다국어 지원 | O (17개 언어) | O (ko/en) | Low |
| PWA 지원 | △ | O | - |
| 다크모드 | X | O | - |
| 토스페이먼츠 결제 | X | O | - |
| 소셜 로그인 | X | O (카카오/네이버) | - |

### 7.2 Beauty ERP에 추가 필요한 핵심 기능 (Priority: HIGH)

#### 1. 회원권/선불카드 시스템
- **금액권**: 충전 → 시술 시 차감, 잔액 관리
- **할인권**: 특정 할인율 적용 카드
- **횟수권**: N회 이용권, 회당 차감
- **포인트**: 적립율 설정, 포인트 사용/소멸
- **가족 회원권**: 가족 공유 잔액/횟수
- **DB 설계**:
  ```
  Membership { id, customerId, shopId, type, name, totalAmount, remainingAmount,
               discountRate, totalCount, remainingCount, expiryDate, status }
  MembershipTransaction { id, membershipId, type(CHARGE/DEDUCT), amount,
                           bookingId, createdAt, note }
  ```

#### 2. 디지털 시술 동의서
- 시술별 동의서 템플릿 관리
- 고객 디지털 서명 (Canvas 기반)
- PDF 생성 및 보관
- 고객 프로필에서 동의서 이력 조회

#### 3. 예약금(보증금) 관리
- 매장별 예약금 설정 (유/무, 금액)
- 온라인 예약 시 예약금 사전 결제
- 방문 완료 시 잔액 결제에서 예약금 차감
- 노쇼 시 예약금 처리 정책

#### 4. 노쇼 방지 시스템
- 예약 리마인더 자동 발송 (D-1, D-day)
- 노쇼 이력 관리 (고객별 노쇼 횟수 추적)
- 노쇼 블랙리스트 기능
- 예약금 필수 설정 (노쇼 이력 있는 고객)

#### 5. 시술 후 자동 알림
- 시술별 후속 관리 알림 템플릿
- 자동 발송 스케줄 (시술 후 1일/3일/7일/14일/30일)
- 재방문 유도 메시지 포함

#### 6. 고급 통계 지표
- **시간활용비율**: (총 시술 시간 / 총 영업 시간) x 100
- **재방문고객비율**: (재방문 고객 수 / 전체 방문 고객 수) x 100
- **객단가 추이**: 기간별 평균 결제 금액 변화
- **시술 인기도**: 시술별 예약 건수 랭킹

#### 7. 네이버페이 결제 연동
- 네이버 예약 연동과 함께 네이버페이 결제 처리
- 매출 관리에서 네이버페이 결제 건 별도 추적
- 정산 관리에서 네이버페이 수수료 자동 계산

### 7.3 Beauty ERP의 차별화 강점 (공비서 대비)

| 기능 | 비고 |
|------|------|
| **다크모드** | 공비서 미지원, 밤에 매장 사용 시 차별화 |
| **토스페이먼츠 통합** | 공비서는 네이버페이 중심, 토스PG로 더 넓은 결제 수단 |
| **소셜 로그인** | 카카오/네이버 소셜 로그인 지원 |
| **PWA** | 앱 설치 없이 웹으로 사용 가능 |
| **모던 기술 스택** | Next.js 14 + NestJS + Prisma (공비서는 레거시 추정) |
| **오픈 아키텍처** | REST API 기반, 향후 확장 용이 |
| **웹 기반 B2C** | 별도 앱 설치 불필요 (공비서는 별도 앱 필요) |

---

## 8. 구현 로드맵 제안

### Phase 1: 핵심 기능 추가 (우선순위 HIGH)
1. 회원권/선불카드 시스템 (DB 스키마 + CRUD + 결제 연동)
2. 예약금 관리 시스템
3. 노쇼 방지 시스템 (리마인더 + 이력 관리)
4. 고급 통계 지표 (시간활용비율, 재방문율)

### Phase 2: 마케팅 강화
5. 시술 후 자동 알림 시스템
6. SMS/LMS 대량 발송 기능
7. 디지털 시술 동의서

### Phase 3: 결제/정산 강화
8. 네이버페이 결제 연동
9. 미등록매출/미수금매출 관리 강화
10. 결제수단별 정산 자동화

### Phase 4: 부가 기능
11. 매장 태그 시스템
12. 체험단 모집 기능
13. 추가 다국어 지원

---

## 9. 기술 참고 사항

### 9.1 공비서 기술 스택 추정
- **백엔드**: Spring Boot (Java/Kotlin) - API URL 패턴 기반 추정
- **모바일**: Android Native (Kotlin) - XAPK 구조 기반
- **이미지 저장소**: AWS S3 (`crm-image.gongbiz.kr`)
  - Presigned URL 방식 업로드
  - CDN: `crm-image.gongbiz.kr` (CloudFront 추정)
- **푸시 알림**: Firebase Cloud Messaging (FCM)
- **결제**: 네이버페이 + 자체 결제
- **인증**: 휴대폰 번호 기반 인증 (`/api/v1/phone/auth/code`)

### 9.2 공비서 앱 Permission 분석
B2B 앱 권한:
- `INTERNET`, `ACCESS_NETWORK_STATE`: 네트워크 통신
- `CAMERA`: 시술 사진 촬영
- `READ_CONTACTS`: 고객 연락처 가져오기
- `ACCESS_FINE_LOCATION`: 매장 위치 설정
- `READ/WRITE_EXTERNAL_STORAGE`: 파일 저장
- `POST_NOTIFICATIONS`: 푸시 알림
- `FOREGROUND_SERVICE`: 백그라운드 동기화
- `RECEIVE_BOOT_COMPLETED`: 자동 시작

B2C 앱 추가 권한:
- `ACCESS_COARSE_LOCATION`: 대략적 위치 (주변 매장 검색)
- `REORDER_TASKS`: 태스크 관리

### 9.3 이미지 업로드 플로우
```
Client → GET /api/v1/image/upload → Server returns Presigned URL
Client → PUT {presignedUrl} (with image binary) → S3
Client → Save image URL to entity
```

---

## 10. 결론

공비서는 한국 뷰티 살롱 시장에서 가장 성숙한 관리 솔루션 중 하나로, 특히 **회원권 시스템**, **네이버 예약/페이 연동**, **마케팅 자동화** 영역에서 강점을 보입니다.

Beauty ERP는 모던 기술 스택(Next.js + NestJS), PWA 지원, 다크모드, 소셜 로그인 등에서 기술적 우위를 가지며, 웹 기반으로 별도 앱 설치 없이 사용할 수 있다는 점이 큰 차별화 포인트입니다.

**가장 시급한 추가 개발 항목**:
1. **회원권/선불카드 시스템** - 뷰티 매장 운영의 핵심 수익 모델
2. **노쇼 방지 + 예약금 시스템** - 매장 매출 보호의 필수 기능
3. **시간활용비율/재방문율 통계** - 매장 경영 인사이트 제공
4. **시술 후 자동 알림** - 고객 재방문 유도의 핵심 마케팅 도구

이 4가지 기능을 우선 구현하면 공비서와의 기능 격차를 크게 줄이면서, 기술적 우위(웹 기반, 모던 UX, PWA)로 차별화할 수 있습니다.

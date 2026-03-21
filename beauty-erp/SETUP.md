# Beauty ERP - Setup Guide (환경 설정 가이드)

## Prerequisites (필수 설치)

### 1. Node.js 20+ LTS
```bash
# https://nodejs.org/en/download 에서 다운로드
node -v  # v20.x 이상 확인
```

### 2. Docker Desktop
```bash
# https://www.docker.com/products/docker-desktop/ 에서 다운로드
# 설치 후 Docker Desktop 실행
docker --version  # 확인
```

### 3. Git
```bash
git --version  # 이미 설치되어 있음
```

---

## Quick Start

### Step 1: 의존성 설치
```bash
cd C:/highman/beauty-erp
npm install
```

### Step 2: 환경변수 설정
```bash
cp .env.example .env
# .env 파일은 이미 생성되어 있음 (개발용 기본값)
```

### Step 3: Docker로 DB 시작
```bash
docker compose up -d
# PostgreSQL (port 5432) + Redis (port 6379) 시작
```

### Step 4: DB 마이그레이션
```bash
npx prisma migrate dev --name init
# 18개 테이블 + 16개 enum 생성
```

### Step 5: 시드 데이터 입력
```bash
npx prisma db seed
# 테스트용 샘플 데이터 생성 (고객, 예약, 결제 등)
```

### Step 6: 개발 서버 시작
```bash
npm run dev
# API: http://localhost:4000
# B2B Web: http://localhost:3000
```

---

## 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@beauty-erp.kr | admin1234 |
| 매장 원장 | owner@beauty-erp.kr | owner1234 |

**Shop ID:** `00000000-0000-4000-8000-000000000001`

---

## DB 확인

```bash
# Prisma Studio (DB GUI)
npx prisma studio
# http://localhost:5555 에서 데이터 확인 가능
```

---

## Docker 없이 PostgreSQL 사용하기

Docker 대신 PostgreSQL을 직접 설치할 수도 있습니다:

1. https://www.postgresql.org/download/windows/ 에서 설치
2. 설치 중 비밀번호 설정 (예: `beauty_erp_dev`)
3. pgAdmin에서 `beauty_erp` 데이터베이스 생성
4. `.env`의 DATABASE_URL을 설치한 PostgreSQL에 맞게 수정

Redis는 MVP 단계에서는 필수가 아닙니다 (세션/캐시 기능 미사용 시).

---

## 트러블슈팅

### Prisma migrate 실패
```bash
# DB 초기화 후 재시도
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Port 충돌
```bash
# .env에서 포트 변경
API_PORT=4001
# next.config.mjs에서 포트 변경
```

### 모듈 설치 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

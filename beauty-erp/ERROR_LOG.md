# Beauty ERP - Error Log (오답노트)

> 개발 중 발생한 오류와 해결 방법을 기록합니다.
> 같은 오류를 반복하지 않기 위한 학습 자료입니다.

---

## 분류 체계

| 카테고리 | 설명 |
|----------|------|
| `ENV` | 환경설정, 의존성, 빌드 관련 |
| `DB` | 데이터베이스, Prisma, 마이그레이션 |
| `AUTH` | 인증, 인가, JWT, 세션 |
| `API` | API 엔드포인트, 요청/응답 |
| `UI` | 프론트엔드 렌더링, 스타일링 |
| `TYPE` | TypeScript 타입 오류 |
| `LOGIC` | 비즈니스 로직 버그 |
| `PERF` | 성능 관련 이슈 |

---

## Error Records

### Template
```
### [카테고리] 오류 제목
- **날짜:** YYYY-MM-DD
- **Phase/Task:** Phase X - Task Y
- **오류 메시지:** `실제 에러 메시지`
- **원인:** 근본 원인 설명
- **해결:** 해결 방법
- **예방:** 재발 방지 대책
- **관련 파일:** file/path.ts
```

---

<!-- 아래에 실제 오류 기록을 추가합니다 -->

### [ENV] Geist 폰트 모듈 미설치
- **날짜:** 2026-03-21
- **Phase/Task:** Phase 1a - Task 4 (Next.js B2B Web)
- **오류 메시지:** `Module not found: Can't resolve 'geist/font/sans'`
- **원인:** `geist` 패키지가 package.json에 포함되지 않았음. Next.js 14에서 Geist 폰트 사용 시 별도 npm 패키지 필요
- **해결:** `npm install geist --workspace=@beauty-erp/b2b-web`
- **예방:** 커스텀 폰트 사용 시 반드시 해당 npm 패키지를 dependencies에 추가. layout.tsx에서 import 시 패키지 존재 여부 확인
- **관련 파일:** `apps/b2b-web/src/app/layout.tsx`, `apps/b2b-web/package.json`

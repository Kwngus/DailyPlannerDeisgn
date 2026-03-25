# Daily Planner — 프로젝트 컨텍스트

## 프로젝트 개요
개인 일정 관리를 위한 타임테이블 기반 Daily/Weekly/Monthly Planner 웹앱.
로그인한 유저별로 일정·할 일·분류를 관리하며, 형광펜 스타일로 일정을 시각화한다.
PWA 적용으로 모바일 홈화면 설치 가능.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, TypeScript, Turbopack) |
| 스타일링 | Tailwind CSS v4 |
| 폰트 | Pretendard (globals.css CDN @import) |
| 백엔드/DB | Supabase (PostgreSQL + Auth) |
| 상태관리 | Zustand |
| 날짜 처리 | dayjs |
| 아이콘 | lucide-react |
| PWA | next-pwa (프로덕션 전용) |
| 배포 | Netlify (`@netlify/plugin-nextjs`) |

---

## 디렉토리 구조

```
DailyPlannerDeisgn/
├── middleware.ts             ← Supabase 인증 미들웨어 (반드시 루트에 위치)
├── netlify.toml
├── next.config.ts            ← PWA: 프로덕션에서만 withPWA 적용, turbopack: {}
├── postcss.config.mjs        ← @tailwindcss/postcss 플러그인
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json         ← PWA manifest
│   └── icons/                ← PWA 아이콘 (72~512px)
└── src/
    ├── app/
    │   ├── globals.css           ← @import Pretendard CDN → @import "tailwindcss" 순서
    │   ├── layout.tsx            ← 루트 레이아웃 (<html><body> 포함, next/font 없음)
    │   ├── page.tsx              ← 로그인 여부에 따라 /app 또는 /login 리다이렉트
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   └── app/
    │       ├── layout.tsx        ← Header + Sidebar + ToastContainer ('use client')
    │       ├── page.tsx          ← 메인 플래너 (Day/Week/Month + TodoPanel)
    │       ├── categories/page.tsx
    │       ├── mypage/page.tsx   ← 서버 컴포넌트
    │       ├── settings/page.tsx
    │       └── todos/page.tsx    ← 모바일용 할 일 전용 페이지
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx        ← 햄버거, 날짜 이동, DAY/WEEK/MON 토글
    │   │   ├── Sidebar.tsx       ← 슬라이드 사이드바
    │   │   └── Fab.tsx           ← 우하단 + 버튼
    │   ├── timetable/
    │   │   ├── DayView.tsx       ← 1일 타임테이블 (시간 행별 구조, 10분 세로선)
    │   │   ├── WeekView.tsx      ← 주간 타임테이블
    │   │   ├── MonthView.tsx     ← 월간 캘린더 (날짜 클릭 → Day 뷰)
    │   │   ├── EventBlock.tsx    ← 가로 배치 형광펜 블록
    │   │   ├── NoteBlock.tsx     ← is_note 이벤트 텍스트 주석
    │   │   └── NowLine.tsx       ← 현재 시각 빨간 수직선
    │   ├── modals/
    │   │   ├── EventModal.tsx    ← 일정 추가/수정/삭제
    │   │   └── TodoModal.tsx     ← 할 일 추가/수정/삭제
    │   ├── todos/
    │   │   └── TodoPanel.tsx     ← 할 일 패널 (날짜별 그룹)
    │   └── ui/
    │       └── ToastContainer.tsx ← 토스트 알림 + Undo 버튼
    ├── lib/
    │   ├── supabase.ts
    │   ├── supabaseServer.ts
    │   ├── timeUtils.ts          ← HOURS [5..23,0,1], ROW_HEIGHT, hourToRowIndex
    │   └── hooks/
    │       ├── useEvents.ts      ← 일정 CRUD + 토스트 + Undo
    │       ├── useCategories.ts
    │       ├── useTodos.ts       ← 할 일 CRUD + 토스트 + Undo
    │       └── useMonthEvents.ts
    ├── store/
    │   ├── plannerStore.ts       ← viewMode, currentDate, navigate
    │   └── toastStore.ts         ← 토스트 전역 상태
    └── types/
        └── index.ts
```

---

## 환경변수 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

- `.env.local`, `.next/` 는 `.gitignore` 에 포함
- Netlify 배포 시 동일한 키를 Environment Variables에 등록

---

## Supabase DB 스키마

```sql
-- 분류
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#FFD250',
  created_at timestamptz default now()
);

-- 일정
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  note text,
  date date not null,
  start_min integer not null,
  end_min integer not null,
  is_note boolean not null default false,
  created_at timestamptz default now()
);

-- 할 일
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  memo text,
  due_date date,
  priority text check (priority in ('high','medium','low')) default 'medium',
  is_done boolean default false,
  created_at timestamptz default now()
);

-- 모든 테이블 RLS 활성화 + auth.uid() = user_id 정책
```

---

## 타입 정의 (src/types/index.ts)

```typescript
export type ViewMode = 'day' | 'week' | 'month'
export type Priority = 'high' | 'medium' | 'low'

export type Category = {
  id: string; user_id: string; name: string; color: string; created_at: string
}

export type Event = {
  id: string; user_id: string; category_id: string | null; category?: Category
  title: string; note: string | null; date: string
  start_min: number; end_min: number
  is_note: boolean
  created_at: string
}

export type Todo = {
  id: string; user_id: string; category_id: string | null; category?: Category
  title: string; memo: string | null; due_date: string | null
  priority: Priority; is_done: boolean; created_at: string
}
```

---

## 핵심 설계 규칙

### 시간 표현
- 모든 시간은 **자정 기준 분(minute)** 으로 저장 (09:00 → 540)
- 타임테이블: **05:00 ~ 01:00** (HOURS = [5,6,...,23,0,1])
- `ROW_HEIGHT = 56px` (1시간 = 56px)
- `hourToRowIndex(h)`: 00→19, 01→20, 나머지 h-5

### 이벤트 블록 (가로 배치)
```typescript
const leftPct = (startMin % 60) / 60 * 100
const widthPct = durationMin / 60 * 100
// isFirst=false이면 텍스트 미표시 (형광펜만)
```

### 색상 처리
```typescript
function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0,2), 16)
  const g = parseInt(c.substring(2,4), 16)
  const b = parseInt(c.substring(4,6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
// 배경: alpha 0.45 / 보더: alpha 0.85
// 인덱스 기반 매핑 사용 금지
```

---

## 토스트 알림 (toastStore)

```typescript
const { show } = useToastStore()

show('일정이 추가됐어요 ✓')                     // success, 2.5초
show('삭제에 실패했어요.', 'error')              // error
show('삭제됐어요', 'info', async () => { ... }) // Undo 포함, 4초
```

- `ToastContainer` 는 `src/app/app/layout.tsx` 에만 위치
- `useEvents`, `useTodos` 양쪽에 연동

---

## 뷰 모드별 동작

| 뷰 | 이동 단위 | TodoPanel | FAB |
|----|----------|-----------|-----|
| day | ±1일 | 표시 (lg+) | 표시 |
| week | ±1주 | 표시 (lg+) | 표시 |
| month | ±1개월 | 숨김 | 숨김 |

월간 뷰: 날짜 클릭 → 해당 날짜 Day 뷰로 이동

---

## CSS / 스타일 설정

```css
/* globals.css 순서 중요 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/...');
@import "tailwindcss";

@theme {
  --font-sans: "Pretendard";
  --font-serif: "Pretendard";
  --font-family-sans: "Pretendard";
  --font-family-serif: "Pretendard";
  --base-font-size: 1.125rem;
}
```

- Tailwind v4: `tailwind.config.ts` 없음
- `postcss.config.mjs`: `@tailwindcss/postcss`

---

## PWA 설정

```typescript
// next.config.ts
const nextConfig = { devIndicators: false, turbopack: {} }
if (process.env.NODE_ENV === 'production') {
  module.exports = withPWA(nextConfig)
} else {
  module.exports = nextConfig
}
```

모바일: Safari → 공유 → 홈 화면에 추가 / Android Chrome → 앱 설치

---

## 배포 (Netlify)

```toml
[build]
  command = "npm run build"
  publish = ".next"
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

배포 후: Supabase → Authentication → URL Configuration에 Netlify 도메인 등록

---

## 알려진 이슈 및 해결 내역

| 이슈 | 원인 | 해결 |
|------|------|------|
| 이벤트 항상 맨 위 표시 | start_min에서 HOUR_START*60 미차감 | topMin = start_min - 5*60 |
| 셀 클릭 시 모달 안 열림 | pointer-events-none 차단 | 래퍼 제거 + stopPropagation |
| 분류 색상 오류 | hex→인덱스 변환 | hex→rgba 직접 변환 |
| CSS 깨짐 | Tailwind v3/v4 혼용 | @import "tailwindcss" 방식 |
| middleware 미작동 | src/ 안에 위치 | 루트로 이동 |
| Hydration mismatch | className 줄바꿈 | 한 줄로 수정 |
| build 오류 (Turbopack) | next-pwa webpack 충돌 | 프로덕션에서만 withPWA |
| 루트 layout.tsx 덮어씌움 | app/app/layout 내용 혼입 | html/body 포함 루트 레이아웃 복구 |
| 토스트 미표시 | app/app/layout에 ToastContainer 누락 | layout에 추가 |

---

## 진행 예정 기능 (우선순위 순)

1. Today 버튼 + 현재 시간 자동 스크롤
2. 스와이프 제스처 (모바일)
3. 스켈레톤 로딩 UI
4. 일정 검색
5. 반복 일정
6. Todo 순서 변경 (드래그)
7. 다크모드
8. 드래그로 일정 생성
9. 에러 핸들링
10. Supabase 실시간 동기화
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
| 백엔드/DB | Supabase (PostgreSQL + Auth + Realtime) |
| 상태관리 | Zustand (persist 미들웨어) |
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
└── src/
    ├── app/
    │   ├── globals.css           ← CSS 변수 정의 (라이트/다크), Pretendard CDN
    │   ├── layout.tsx            ← 루트 레이아웃 (ThemeProvider 포함)
    │   ├── page.tsx              ← 로그인 여부에 따라 /app 또는 /login 리다이렉트
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   └── app/
    │       ├── layout.tsx        ← Header + Sidebar + ToastContainer + RealtimeIndicator
    │       ├── page.tsx          ← 메인 플래너 (Day/Week/Month + TodoPanel), defaultView 적용
    │       ├── dashboard/page.tsx ← 대시보드 (오늘 일정 요약, 다가오는 일정, 할 일 현황)
    │       ├── categories/page.tsx ← 분류 관리 (색상 직접 입력, 수정 기능)
    │       ├── mypage/
    │       │   ├── page.tsx      ← 서버 컴포넌트 (통계 데이터 쿼리)
    │       │   └── MypageClient.tsx ← 프로필, 통계, 히트맵, 계정 관리
    │       ├── settings/page.tsx ← 배경 테마 + 포인트 컬러 + 플래너 설정
    │       └── todos/page.tsx    ← 모바일용 할 일 전용 페이지
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx        ← 햄버거, 날짜 이동, DAY/WEEK/MON 토글, Today 버튼, 검색
    │   │   ├── Sidebar.tsx       ← 슬라이드 사이드바 (대시보드 링크 포함)
    │   │   └── Fab.tsx           ← 우하단 + 버튼 (var(--point) 색상)
    │   ├── timetable/
    │   │   ├── DayView.tsx       ← 1일 타임테이블 (getHours() 동적 배열, 드래그 생성)
    │   │   ├── WeekView.tsx      ← 주간 타임테이블 (weekStart 반영)
    │   │   ├── MonthView.tsx     ← 월간 캘린더 (weekStart 반영, 날짜 클릭 → Day 뷰)
    │   │   ├── EventBlock.tsx    ← 형광펜 블록 (취소선, timeFormat 반영)
    │   │   ├── NoteBlock.tsx     ← is_note 이벤트 (회색 점선 테두리, 중앙 정렬)
    │   │   ├── AllDayRow.tsx     ← 종일 일정 뱃지 행
    │   │   ├── DragPreview.tsx   ← 드래그 생성 프리뷰
    │   │   ├── NowLine.tsx       ← 현재 시각 세로선 (시간 행 안에서 분 위치에 수직 표시)
    │   │   ├── DayViewSkeleton.tsx
    │   │   ├── WeekViewSkeleton.tsx
    │   │   └── MonthViewSkeleton.tsx
    │   ├── modals/
    │   │   ├── EventModal.tsx    ← 일정 추가/수정/삭제 (종일, 취소, 반복, ESC 닫기)
    │   │   ├── TodoModal.tsx     ← 할 일 추가/수정/삭제 (ESC 닫기)
    │   │   └── SearchModal.tsx   ← 일정+할일 검색, 분류 필터 (ESC 닫기)
    │   ├── todos/
    │   │   ├── TodoPanel.tsx     ← 할 일 패널 (드래그 순서 변경)
    │   │   └── TodoPanelSkeleton.tsx
    │   └── ui/
    │       ├── ThemeProvider.tsx ← 다크/라이트 + bgTheme + pointColor CSS 변수 주입
    │       ├── ToastContainer.tsx ← 토스트 알림 + Undo 버튼
    │       ├── ErrorBoundary.tsx
    │       ├── RealtimeIndicator.tsx
    │       └── SwipeContainer.tsx ← 모바일 스와이프 제스처
    ├── lib/
    │   ├── supabase.ts
    │   ├── supabaseServer.ts
    │   ├── handleError.ts        ← getErrorMessage()
    │   ├── timeUtils.ts          ← getHours(), getHourStart(), ROW_HEIGHT, minToTime(12h/24h)
    │   └── hooks/
    │       ├── useEvents.ts      ← 일정 CRUD + 토스트 + Undo + 반복 일정 생성
    │       ├── useCategories.ts  ← 분류 CRUD (updateCategory 포함)
    │       ├── useTodos.ts       ← 할 일 CRUD + 토스트 + Undo + 드래그 순서
    │       ├── useMonthEvents.ts
    │       ├── useSearch.ts      ← 일정+할일 검색
    │       ├── useDragCreate.ts  ← 길게 누르기(350ms) 후 드래그 일정 생성
    │       ├── useScrollToNow.ts ← 현재 시각으로 자동 스크롤
    │       ├── useEscClose.ts    ← ESC 키로 모달 닫기
    │       ├── useRealtimeEvents.ts ← Supabase Realtime 이벤트 구독
    │       └── useRealtimeTodos.ts  ← Supabase Realtime 할일 구독
    ├── store/
    │   ├── plannerStore.ts       ← viewMode, currentDate, navigate, setViewMode
    │   ├── toastStore.ts         ← 토스트 전역 상태
    │   ├── themeStore.ts         ← theme(light/dark/system) + bgTheme + pointColor
    │   └── settingsStore.ts      ← defaultView, weekStart, timeFormat, fontSize, timetableStart
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
  is_allday boolean not null default false,
  is_cancelled boolean not null default false,
  recurrence_type text check (recurrence_type in ('none','daily','weekly','monthly')) default 'none',
  recurrence_end_date date,
  recurrence_group_id uuid,
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
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- RLS 활성화 + auth.uid() = user_id 정책
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.todos enable row level security;
create policy "본인 데이터만 접근" on public.categories for all using (auth.uid() = user_id);
create policy "본인 데이터만 접근" on public.events for all using (auth.uid() = user_id);
create policy "본인 데이터만 접근" on public.todos for all using (auth.uid() = user_id);
```

---

## 타입 정의 (src/types/index.ts)

```typescript
export type ViewMode = 'day' | 'week' | 'month'
export type Priority = 'high' | 'medium' | 'low'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export type Category = {
  id: string; user_id: string; name: string; color: string; created_at: string
}

export type Event = {
  id: string; user_id: string; category_id: string | null; category?: Category
  title: string; note: string | null; date: string
  start_min: number; end_min: number
  is_note: boolean
  is_allday: boolean
  is_cancelled: boolean
  recurrence_type: RecurrenceType
  recurrence_end_date: string | null
  recurrence_group_id: string | null
  created_at: string
}

export type Todo = {
  id: string; user_id: string; category_id: string | null; category?: Category
  title: string; memo: string | null; due_date: string | null
  priority: Priority; is_done: boolean; sort_order: number; created_at: string
}
```

---

## 핵심 설계 규칙

### 시간 표현
- 모든 시간은 **자정 기준 분(minute)** 으로 저장 (09:00 → 540)
- 타임테이블 시간 배열: `getHours()` — `settingsStore.timetableStart` 기준 19시간 동적 생성
  - 기본: 05:00 ~ 01:00 (timetableStart=5), 변경 가능 (0~12)
  - 컴포넌트 안에서 `const HOURS = getHours()` 로 사용 (`HOURS` 상수는 레거시)
- `ROW_HEIGHT = 56px` (1시간 = 56px)
- `getHourStart()` — `HOUR_START` 상수 대신 settingsStore 기반 동적 반환

### 시간 형식
```typescript
minToTime(min: number, format: '24h' | '12h' = '24h'): string
// format은 settingsStore.timeFormat 에서 읽어 전달
// EventBlock, SearchModal, MonthView에서 timeFormat 반영
// EventModal의 <input type="time"> 초기화에는 항상 24h 포맷 유지
```

### 주 시작 요일
```typescript
getWeekDates(dateStr: string, weekStart: 'sun' | 'mon' = 'sun'): string[]
// WeekView, MonthView에서 settingsStore.weekStart 전달
// MonthView: weekStart='mon'이면 calStart/calEnd/DOW 배열 조정
```

### 이벤트 블록 (가로 배치)
```typescript
const leftPct = (startMin % 60) / 60 * 100
const widthPct = durationMin / 60 * 100
// isFirst=false이면 텍스트 미표시 (형광펜만)
// is_cancelled: opacity 0.6, title line-through, 가운데 가로선, lighter 색상
```

### NowLine (현재 시각 표시)
- **세로선**: 현재 시각이 속한 시간 행(hour row) 안에서 분(minute) 위치에 수직으로 표시
- `topPx = hourIndex * ROW_HEIGHT` (해당 행의 상단)
- `leftPct = (minute / 60) * 100` (행 내 가로 위치 %)
- `var(--point)` 색상 사용

### 색상 처리
```typescript
function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0,2), 16)
  const g = parseInt(c.substring(2,4), 16)
  const b = parseInt(c.substring(4,6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
// 이벤트 배경: alpha 0.45 / 보더: alpha 0.85
// 인덱스 기반 색상 매핑 사용 금지
```

---

## CSS 변수 시스템

### 라이트 모드 기본값 (globals.css :root)
```css
--bg: #F7F5F0;        /* 앱 배경 */
--surface: #FFFFFF;   /* 카드/모달 배경 */
--border: #E5E7EB;
--border-subtle: #F3F4F6;
--text: #1A1714;
--text-muted: #8A847C;
--accent: #1A1714;    /* 배경 테마의 사이드바/강조색 */
--accent-fg: #F7F5F0;
--point: #1A1714;     /* 포인트 컬러 (FAB, 저장버튼, 오늘날짜, NowLine 등) */
--point-fg: #FFFFFF;
```

### 다크 모드 (.dark)
```css
--bg: #1A1714; --surface: #242018; --border: #38342E;
--border-subtle: #2C2820; --text: #F0EDE8; --text-muted: #8A847C;
--accent: #F0EDE8; --accent-fg: #1A1714;
```
다크 모드에서는 배경 테마 적용 안 됨 (위 변수 사용).

### var(--point) 적용 요소
FAB 버튼, 저장 버튼, 오늘 날짜 동그라미, NowLine, DAY/WEEK/MON 활성 토글, TodoPanel + 버튼

### var(--accent) 적용 요소
UI 선택 칩 활성 상태, 입력 focus 테두리, 배경 테마의 강조색 계열

---

## 테마 시스템 (themeStore)

### 배경 테마 8종 (BgThemeId)
`cream` | `blossom` | `sky` | `mint` | `lavender` | `peach` | `butter` | `cloud`

각 테마: `{ bg, surface, accent, accentFg, label, desc }`
ThemeProvider가 라이트 모드에서 `document.documentElement.style.setProperty`로 실시간 주입.
border는 bg 색상을 약간(-14) 어둡게 계산.

### 포인트 컬러 10종 (PointColorId)
`charcoal` | `rose` | `blue` | `green` | `purple` | `yellow` | `orange` | `gray` | `teal` | `pink`

`'custom'` 선택 시 hex 직접 입력 (`customPointColor`).
커스텀 fg는 luminance 기준 자동 계산:
```typescript
function getContrastFg(hex: string): string {
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255
  return luminance > 0.5 ? '#1A1714' : '#FFFFFF'
}
```

persist: `themeStore` → `'planner-theme'` / `settingsStore` → `'planner-settings'`

---

## 설정값 (settingsStore)

| 설정 | 타입 | 기본값 | 적용 위치 |
|------|------|--------|-----------|
| defaultView | `'day'\|'week'\|'month'` | `'day'` | app/page.tsx 첫 진입 시 setViewMode |
| weekStart | `'sun'\|'mon'` | `'sun'` | WeekView, MonthView |
| timeFormat | `'24h'\|'12h'` | `'24h'` | EventBlock, SearchModal, MonthView |
| fontSize | `'small'\|'medium'\|'large'` | `'medium'` | --base-font-size CSS 변수 |
| timetableStart | `0~12` | `5` | getHours(), getHourStart(), NowLine |

---

## 토스트 알림 (toastStore)

```typescript
const { show } = useToastStore()

show('일정이 추가됐어요 ✓')                     // success, 2.5초
show('삭제에 실패했어요.', 'error')              // error
show('삭제됐어요', 'info', async () => { ... }) // Undo 포함, 4초
```

- `ToastContainer` 는 `src/app/app/layout.tsx` 에만 위치
- 에러 메시지는 반드시 `getErrorMessage(error)` 사용 (handleError.ts)

---

## 반복 일정

- `recurrence_type`: `'none' | 'daily' | 'weekly' | 'monthly'`
- `recurrence_end_date`: 미설정 시 3개월 후 자동 설정
- `recurrence_group_id`: 같은 반복 그룹 UUID (삭제 시 그룹 전체 삭제에 사용)
- 삭제: "이 일정만" / "반복 전체" 선택 모달
- 수정: 단건만 수정 (recurrence 필드 변경 없음)

---

## 종일 일정 / 메모 / 취소

- `is_allday=true`: `AllDayRow`에 뱃지로 표시. start_min/end_min=0으로 저장
- `is_note=true`: 타임테이블에 회색 점선 테두리 블록(NoteBlock). 텍스트 중앙 정렬
- `is_cancelled=true`: EventBlock에 opacity 0.6 + title line-through + 블록 중앙 가로선

---

## 드래그로 일정 생성 (useDragCreate)

- 350ms 길게 누르면 cursor → crosshair (`isLongPressed` 상태)
- 이후 드래그 → `onDragCreate(dateStr, startMin, endMin)` 콜백
- 드래그 없이 손 떼면 → `onCellClick(dateStr, hour)` 콜백 (일반 셀 클릭)
- 10px 이상 이동 시 long-press 타이머 취소 (스크롤과 구분)

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
@variant dark (&:where(.dark, .dark *));
```

- Tailwind v4: `tailwind.config.ts` 없음
- `postcss.config.mjs`: `@tailwindcss/postcss`
- CSS 변수 Tailwind 사용: `border-[var(--border)]`, `bg-[var(--surface)]` 등
- hover 상태 CSS 변수: `style={{ background: 'var(--point)' }}` inline 방식 사용

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
| 이벤트 항상 맨 위 표시 | start_min에서 hourStart*60 미차감 | getHourStart() 기반으로 계산 |
| 셀 클릭 시 모달 안 열림 | pointer-events-none 차단 | 래퍼 제거 + stopPropagation |
| 분류 색상 오류 | hex→인덱스 변환 | hex→rgba 직접 변환 |
| CSS 깨짐 | Tailwind v3/v4 혼용 | @import "tailwindcss" 방식 |
| middleware 미작동 | src/ 안에 위치 | 루트로 이동 |
| build 오류 (Turbopack) | next-pwa webpack 충돌 | 프로덕션에서만 withPWA |
| 토스트 미표시 | app/app/layout에 ToastContainer 누락 | layout에 추가 |
| Supabase 400 오류 | is_allday/is_cancelled 컬럼 없음 | ALTER TABLE로 컬럼 추가 필요 |
| 다크모드에서 버튼 안 보임 | bg-[#1A1714] 하드코딩 | var(--point) / var(--accent) 로 교체 |

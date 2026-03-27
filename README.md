# ✦ Daily Planner

타임테이블 기반 개인 일정 관리 웹앱. 형광펜 스타일로 일정을 시각화하며, 로그인한 유저별로 일정·할 일·분류를 관리합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, TypeScript, Turbopack) |
| 스타일링 | Tailwind CSS v4 |
| 폰트 | Pretendard |
| 백엔드/DB | Supabase (PostgreSQL + Auth) |
| 상태관리 | Zustand |
| 날짜 처리 | dayjs |
| 아이콘 | lucide-react |
| PWA | next-pwa (프로덕션 전용) |
| 배포 | Netlify |

---

## 주요 기능

- **Day / Week / Month 뷰** — 타임테이블 기반 시간대별 일정 관리
- **종일 일정** — 시간 없이 날짜 전체에 해당하는 특별 일정 표시
- **메모** — 타임테이블에 회색 점선 블록으로 표시되는 텍스트 주석
- **반복 일정** — 매일 / 매주 / 매월 반복, 종료일 지정 가능
- **일정 취소 처리** — 취소된 일정에 가로선 + 흐림 효과
- **드래그로 일정 생성** — 길게 누른 후 드래그하여 시간 범위 지정
- **할 일(Todo) 관리** — 우선순위·분류·마감일 설정, 드래그로 순서 변경
- **분류(Category)** — 색상 코드 직접 입력 가능한 커스텀 분류
- **대시보드** — 오늘의 일정 요약·다가오는 일정·할 일 현황
- **일정 검색** — 제목 키워드 및 분류 필터
- **다크모드** — CSS 변수 기반 라이트/다크 테마
- **실시간 동기화** — Supabase Realtime으로 다기기 동기화
- **PWA** — 모바일 홈화면 설치 지원

---

## 시작하기

### 요구사항

- Node.js 18+
- Supabase 프로젝트

### 설치

```bash
git clone https://github.com/your-username/daily-planner.git
cd daily-planner
npm install
```

### 환경변수 설정

`.env.local` 파일을 생성합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### DB 마이그레이션

Supabase SQL Editor에서 아래를 실행합니다:

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

-- RLS 활성화
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.todos enable row level security;

-- RLS 정책 (각 테이블 동일하게 적용)
create policy "본인 데이터만 접근" on public.categories for all using (auth.uid() = user_id);
create policy "본인 데이터만 접근" on public.events for all using (auth.uid() = user_id);
create policy "본인 데이터만 접근" on public.todos for all using (auth.uid() = user_id);
```

### 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

---

## 배포 (Netlify)

1. Netlify에 레포지토리 연결
2. Build command: `npm run build` / Publish directory: `.next`
3. Environment Variables에 `.env.local` 동일하게 등록
4. Supabase → Authentication → URL Configuration에 Netlify 도메인 등록

---

## 프로젝트 구조

```
src/
├── app/
│   ├── app/
│   │   ├── dashboard/     # 대시보드
│   │   ├── categories/    # 분류 관리
│   │   ├── todos/         # 모바일용 할 일 페이지
│   │   ├── mypage/
│   │   └── settings/
│   ├── login/
│   └── signup/
├── components/
│   ├── layout/            # Header, Sidebar, Fab
│   ├── timetable/         # DayView, WeekView, MonthView, EventBlock 등
│   ├── modals/            # EventModal, TodoModal, SearchModal
│   ├── todos/             # TodoPanel
│   └── ui/                # ToastContainer, ErrorBoundary, SwipeContainer 등
├── lib/
│   ├── hooks/             # useEvents, useTodos, useCategories 등
│   └── timeUtils.ts
├── store/                 # Zustand (plannerStore, toastStore)
└── types/
```

---

## 라이선스

MIT

#### 4-4. Netlify 연결

1. [netlify.com](https://netlify.com) 접속 → **Add new site → Import an existing project**
2. **GitHub** 선택 → 저장소 선택
3. Build settings는 자동 감지됨
4. **Environment variables** 에 아래 두 값 추가:
```
NEXT_PUBLIC_SUPABASE_URL        = (Supabase Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY   = (Supabase anon public key)
```

5. **Deploy site** 클릭!

---

#### 4-5. Supabase 허용 URL 등록

배포 후 Netlify 도메인 (`https://your-site.netlify.app`) 을 Supabase에 등록해야 로그인이 작동해요.

**Supabase 대시보드 → Authentication → URL Configuration**
```
Site URL:
https://your-site.netlify.app

Redirect URLs:
https://your-site.netlify.app/**
```

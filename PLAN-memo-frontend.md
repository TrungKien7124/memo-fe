# PLAN: Memo Frontend

> **Ngày tạo:** 2026-03-10 · **Loại:** Kế hoạch phát triển Frontend
> **Tham chiếu backend:** [PLAN-memo-design.md](file:///home/kiendt/workspace/memo/docs/PLAN-memo-design.md)

---

## 1. Tổng Quan

Xây dựng giao diện web cho nền tảng học tiếng Anh **MEMO** – phong cách Duolingo (vui, gamified, rõ ràng tiến độ) nhưng tối ưu cho giao diện desktop/web responsive.

### 1.1 Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| **Framework** | ReactJS 18 + Vite | Nhẹ, fast HMR, không cần SSR |
| **Styling** | CSS Modules (`*.module.css`) | Scoped CSS, không conflict class name, full control |
| **UI Library** | Ant Design 5 | Component sẵn có, form/table/modal mạnh, theme token |
| **State** | Redux Toolkit | Global state, predictable, DevTools mạnh |
| **Routing** | React Router v6 | Client-side routing chuẩn cho SPA |
| **HTTP** | Axios | Interceptor linh hoạt, auto token refresh, cancel request |
| **Auth** | JWT (access + refresh token) | Theo thiết kế backend |
| **Deploy** | Vercel | Free tier, auto-deploy từ Git |

---

## 2. Design System

### 2.1 Color Palette

Lấy cảm hứng từ Facebook (blue/white) + Duolingo (gamified accents):

#### Primary Colors

| Tên | Hex | Dùng cho |
|-----|-----|----------|
| **Blue-600** (Primary) | `#1877F2` | CTA buttons, links, active states |
| **Blue-700** (Hover) | `#1464CC` | Button hover, pressed states |
| **Blue-800** (Dark) | `#0F4FA8` | Header bar, deep accents |
| **Blue-100** (Light) | `#E7F3FF` | Selected state backgrounds, badges |
| **Blue-50** (Surface) | `#F0F7FF` | Card backgrounds, subtle highlights |

#### Neutral Colors

| Tên | Hex | Dùng cho |
|-----|-----|----------|
| **White** | `#FFFFFF` | Main background, cards |
| **Gray-50** | `#F5F6F7` | Page background, alternating rows |
| **Gray-100** | `#E4E6EB` | Borders, dividers |
| **Gray-300** | `#B0B3B8` | Placeholder text, disabled |
| **Gray-500** | `#65676B` | Secondary text |
| **Gray-800** | `#1C1E21` | Primary text |

#### Gamification Accents (Duolingo-inspired)

| Tên | Hex | Dùng cho |
|-----|-----|----------|
| **Green-500** (Success) | `#58CC02` | Correct answer, hoàn thành, XP |
| **Green-600** (Success Hover) | `#4CAD02` | Hover trên success buttons |
| **Red-500** (Error) | `#FF4B4B` | Wrong answer, lỗi, cảnh báo |
| **Orange-500** (Warning) | `#FF9600` | Streak, warning, pending |
| **Gold-500** (XP/Reward) | `#FFC800` | XP badges, achievements, stars |
| **Purple-500** (Premium) | `#CE82FF` | Premium features, special items |

#### Semantic Tokens (CSS Variables)

```css
:root {
  /* Primary */
  --color-primary: #1877F2;
  --color-primary-hover: #1464CC;
  --color-primary-dark: #0F4FA8;
  --color-primary-light: #E7F3FF;
  --color-primary-surface: #F0F7FF;

  /* Neutral */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F5F6F7;
  --color-border: #E4E6EB;
  --color-text-primary: #1C1E21;
  --color-text-secondary: #65676B;
  --color-text-disabled: #B0B3B8;

  /* Gamification */
  --color-success: #58CC02;
  --color-success-hover: #4CAD02;
  --color-error: #FF4B4B;
  --color-warning: #FF9600;
  --color-xp: #FFC800;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06);

  /* Border Radius (Duolingo style – friendly, rounded) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Spacing (8px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-size-4xl: 36px;

  /* Transition */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

### 2.2 Ant Design Theme Override

Cấu hình Ant Design `ConfigProvider` với design tokens:

```js
// theme/antdTheme.js
export const antdTheme = {
  token: {
    colorPrimary: '#1877F2',
    colorSuccess: '#58CC02',
    colorError: '#FF4B4B',
    colorWarning: '#FF9600',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F6F7',
    colorBorder: '#E4E6EB',
    colorText: '#1C1E21',
    colorTextSecondary: '#65676B',
  },
};
```

### 2.3 Typography

| Element | Font | Size | Weight | Line-height |
|---------|------|------|--------|-------------|
| **H1** (Page title) | Inter | 30–36px | 700 | 1.2 |
| **H2** (Section title) | Inter | 24px | 600 | 1.3 |
| **H3** (Card title) | Inter | 20px | 600 | 1.4 |
| **Body** | Inter | 16px | 400 | 1.5 |
| **Body small** | Inter | 14px | 400 | 1.5 |
| **Caption** | Inter | 12px | 400 | 1.4 |
| **Button** | Inter | 14–16px | 600 | 1 |

### 2.4 Duolingo-Inspired Design Principles

| Nguyên tắc | Áp dụng vào MEMO |
|------------|-------------------|
| **Tiến độ rõ ràng** | Progress bar ở mọi nơi (khóa học, SRS, daily goal) |
| **Gamified feedback** | Animation khi đúng/sai, XP popup, streak counter |
| **Friendly UI** | Bo tròn (12–16px radius), icon minh họa, micro-interactions |
| **Focused learning** | Khi vào review/speaking session → full-screen mode, ẩn sidebar |
| **Achievement thưởng** | Badge, daily streak flame, level-up animation |

### 2.5 Component Style Props Pattern

Mọi shared component **phải hỗ trợ style customization** qua props, không cần sửa CSS thủ công:

```jsx
// Ví dụ: ProgressBar component
import styles from './ProgressBar.module.css';

function ProgressBar({ percent, height, color, className, style }) {
  return (
    <div
      className={`${styles.track} ${className || ''}`}
      style={{ height, ...style }}
    >
      <div
        className={styles.fill}
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

// Sử dụng:
<ProgressBar percent={75} height="12px" color="var(--color-success)" />
<ProgressBar percent={40} color="var(--color-xp)" style={{ borderRadius: 0 }} />
```

**Quy tắc cho mọi shared component:**

| Prop | Kiểu | Mục đích |
|------|------|----------|
| `className` | `string` | Thêm CSS class bên ngoài, merge với class nội bộ |
| `style` | `object` | Override inline style trực tiếp |
| **Props riêng** | varies | Thuộc tính thường thay đổi (color, size, variant...) |

> **Class merge pattern:** Dùng `clsx` hoặc template literal để merge `className` nội bộ với `className` từ props.

```jsx
// Pattern chuẩn cho mọi component
import clsx from 'clsx';
import styles from './MyComponent.module.css';

function MyComponent({ variant = 'primary', size = 'md', className, style, children }) {
  return (
    <div
      className={clsx(styles.root, styles[variant], styles[size], className)}
      style={style}
    >
      {children}
    </div>
  );
}
```

---

## 3. Kiến Trúc Frontend

### 3.1 Cấu trúc thư mục

```
memo-fe/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                      # App entry + providers
│   │   ├── App.jsx
│   │   ├── App.module.css
│   │   └── store.js              # Redux store config
│   │
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/               # Shared UI (hỗ trợ className/style props)
│   │   ├── Layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── MainLayout.module.css
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Sidebar.module.css
│   │   │   ├── Header.jsx
│   │   │   └── Header.module.css
│   │   ├── XPBadge/
│   │   │   ├── XPBadge.jsx
│   │   │   └── XPBadge.module.css
│   │   ├── ProgressBar/
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ProgressBar.module.css
│   │   ├── StreakCounter/
│   │   ├── FlashcardViewer/
│   │   └── ProtectedRoute.jsx
│   │
│   ├── features/                 # Feature modules (Redux slices + pages)
│   │   ├── auth/
│   │   │   ├── authSlice.js      # Redux slice
│   │   │   ├── authService.js    # Axios API calls
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LoginPage.module.css
│   │   │   ├── RegisterPage.jsx
│   │   │   └── RegisterPage.module.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DashboardPage.module.css
│   │   │   ├── DailyGoalWidget.jsx
│   │   │   ├── StreakWidget.jsx
│   │   │   └── RecentActivity.jsx
│   │   │
│   │   ├── courses/
│   │   │   ├── courseService.js   # Axios API calls
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── CoursesPage.module.css
│   │   │   ├── CourseDetailPage.jsx
│   │   │   ├── ModuleList.jsx
│   │   │   ├── LessonPage.jsx
│   │   │   └── LessonPage.module.css
│   │   │
│   │   ├── flashcard/
│   │   │   ├── flashcardService.js
│   │   │   ├── flashcardSlice.js
│   │   │   ├── FoldersPage.jsx
│   │   │   ├── FoldersPage.module.css
│   │   │   ├── FlashcardListPage.jsx
│   │   │   ├── FlashcardListPage.module.css
│   │   │   └── FlashcardForm.jsx
│   │   │
│   │   ├── review/
│   │   │   ├── reviewService.js
│   │   │   ├── reviewSlice.js
│   │   │   ├── ReviewSessionPage.jsx
│   │   │   ├── ReviewSessionPage.module.css
│   │   │   ├── ReviewCard.jsx
│   │   │   ├── ReviewResult.jsx
│   │   │   └── ReviewHistory.jsx
│   │   │
│   │   ├── speaking/
│   │   │   ├── speakingService.js
│   │   │   ├── SpeakingPage.jsx
│   │   │   ├── SpeakingSession.jsx
│   │   │   ├── SpeakingSession.module.css
│   │   │   ├── ChatBubble.jsx
│   │   │   └── AudioRecorder.jsx
│   │   │
│   │   ├── gamification/
│   │   │   ├── gamificationService.js
│   │   │   ├── LeaderboardPage.jsx
│   │   │   └── ProfileStatsPage.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminCoursesPage.jsx
│   │       └── AdminUsersPage.jsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useAudioRecorder.js
│   │   └── useActiveTime.js      # Track thời gian học thực tế
│   │
│   ├── services/                 # Axios config + interceptors
│   │   └── axiosClient.js        # Axios instance, baseURL, token interceptor
│   │
│   ├── styles/                   # Global styles (không dùng module)
│   │   ├── reset.css
│   │   ├── variables.css         # CSS custom properties (palette)
│   │   ├── global.css            # Typography, base styles
│   │   └── animations.css        # Shared keyframes
│   │
│   ├── utils/                    # Helper functions
│   │   ├── formatDate.js
│   │   ├── formatXP.js
│   │   └── constants.js
│   │
│   ├── router.jsx                # React Router config
│   └── main.jsx                  # Vite entry
│
├── index.html
├── vite.config.js
├── package.json
├── vercel.json
└── .env.example
```

### 3.2 State Management Architecture

```
┌─────────────────────────────────────────────┐
│               Redux Store                   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │  authSlice   │  │  flashcardSlice  │    │
│  │  - user      │  │  - currentFolder │    │
│  │  - tokens    │  │  - editingCard   │    │
│  │  - isAuth    │  └──────────────────┘    │
│  └──────────────┘                           │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ reviewSlice  │  │    uiSlice       │    │
│  │ - sessionId  │  │  - sidebarOpen   │    │
│  │ - cards[]    │  │  - toasts[]      │    │
│  │ - currentIdx │  └──────────────────┘    │
│  └──────────────┘                           │
└─────────────────────────────────────────────┘
         ▲ dispatch(actions)
         │
┌─────────────────────────────────────────────┐
│          Axios Service Layer                │
│  ┌─────────────────────────────────────┐    │
│  │       axiosClient.js (shared)       │    │
│  │  - baseURL, token interceptor       │    │
│  │  - auto refresh on 401              │    │
│  └─────────────────────────────────────┘    │
│  authService.js  │  courseService.js        │
│  flashcardService.js │ reviewService.js     │
│  speakingService.js  │ gamificationService  │
└─────────────────────────────────────────────┘
```

**Nguyên tắc:**
- **Server data** → Axios service → `dispatch(action)` hoặc `createAsyncThunk` → Redux slice
- **Auth state** → `authSlice` (JWT tokens, user info, persist với localStorage)
- **UI state** → `uiSlice` hoặc local component state
- **Feature state** → Slice riêng chỉ khi cần global (review session, flashcard editing)
- **Loading/Error** → Mỗi slice tự quản lý `status: 'idle' | 'loading' | 'succeeded' | 'failed'`

### 3.3 Axios Client Setup

```js
// services/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor – gắn access token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – auto refresh token khi 401
let isRefreshing = false;
let failedQueue = [];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent 401 requests
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${baseURL}/api/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        // Retry queued requests
        failedQueue.forEach(({ resolve }) => resolve(data.access));
        failedQueue = [];
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(originalRequest);
      } catch (err) {
        failedQueue.forEach(({ reject }) => reject(err));
        failedQueue = [];
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

### 3.5 Error Handling Contract (BE -> FE)

Backend trả lỗi theo schema thống nhất:

```json
{
  "message": "Error summary",
  "old_data": { "email": "alice@example.com" },
  "error": {
    "email": ["Invalid email format"],
    "password": ["Password is too short"]
  }
}
```

Frontend phải xử lý theo thứ tự:
1. Hiển thị `message` trên toast/alert.
2. Dùng `old_data` để `form.setFieldsValue(old_data)` (giữ dữ liệu user vừa nhập).
3. Dùng `error` để map vào `Form.Item`:
   - `form.setFields([{ name: 'email', errors: ['...'] }])`
   - input lỗi sẽ tự đỏ + hiển thị message dưới ô input.

> [!IMPORTANT]
> Không parse lỗi bằng `detail` hoặc format cũ rời rạc theo từng màn hình.  
> Luôn dùng utility chung để parse lỗi API và apply cho form.

### 3.4 Routing

```jsx
// router.jsx
/                       → redirect → /dashboard
/login                  → LoginPage
/register               → RegisterPage

/dashboard              → DashboardPage (daily goal, streak, recent)

/courses                → CoursesPage (browse courses)
/courses/:id            → CourseDetailPage (modules + lessons)
/courses/:id/lessons/:lessonId → LessonPage (video player)

/flashcards             → FoldersPage (folder list)
/flashcards/:folderId   → FlashcardListPage (cards in folder)

/review                 → ReviewSessionPage (SRS ôn tập - full screen)
/review/history         → ReviewHistory

/speaking               → SpeakingPage (topic list)
/speaking/:sessionId    → SpeakingSession (AI chat - full screen)

/leaderboard            → LeaderboardPage
/profile                → ProfileStatsPage

/admin/courses          → AdminCoursesPage (teacher/admin)
/admin/users            → AdminUsersPage (admin only)
```

---

## 4. Các Trang & Components Chính

### 4.1 Tổng Quan Pages

| # | Page | Mô tả | Ưu tiên |
|---|------|--------|---------|
| 1 | **Login / Register** | Form đăng nhập/đăng ký, JWT auth | P0 |
| 2 | **Dashboard** | Daily goal, streak, progress tổng quan, XP | P0 |
| 3 | **Courses** | Browse + enroll khóa học | P0 |
| 4 | **Lesson** | Video player + progress tracking | P0 |
| 5 | **Flashcard Management** | CRUD folders + cards | P0 |
| 6 | **Review Session** | Full-screen SRS ôn tập (Duolingo-style) | P0 |
| 7 | **Speaking Session** | Full-screen AI conversation | P1 |
| 8 | **Leaderboard** | Rankings theo XP / thời gian học | P1 |
| 9 | **Profile / Stats** | XP, streak, learning history | P1 |
| 10 | **Admin** | Quản lý courses (teacher/admin) | P2 |

### 4.2 Shared Components

| Component | Chức năng |
|-----------|-----------|
| `MainLayout` | Sidebar (nav) + Header (user info, XP, streak) + Content area |
| `ProtectedRoute` | Redirect về /login nếu chưa auth |
| `ProgressBar` | Thanh tiến độ animated (dùng khắp nơi) |
| `XPBadge` | Hiển thị XP với animation pop-up khi cộng |
| `StreakCounter` | Icon lửa + số ngày streak |
| `FlashcardViewer` | Card flip animation (front ↔ back) |
| `AudioRecorder` | Record audio + gửi lên server (speaking) |

---

## 5. Luồng Dữ Liệu Quan Trọng

### 5.1 Auth Flow

```
1. User nhập email (hoặc username) + password
2. POST /api/auth/login/ → nhận { access, refresh, user }
3. Lưu tokens vào localStorage, user info vào Redux (authSlice)
4. Axios interceptor tự gắn access token vào header mọi request
5. Access hết hạn (401) → interceptor tự gọi /api/auth/refresh/ → update token → retry request
6. Nhiều request 401 đồng thời → queue lại, chỉ refresh 1 lần (mutex pattern)
7. Refresh hết hạn → clear storage → redirect /login
```

### 5.4 Form Error Flow

```
1. User submit form (register, login, create folder, create flashcard, ...)
2. API trả lỗi schema chuẩn: message + old_data + error
3. FE show toast(message)
4. FE setFieldsValue(old_data)
5. FE setFields(error map) -> tô đỏ đúng ô field + hiển thị text lỗi
6. User chỉnh ngay tại field lỗi, không cần nhập lại toàn bộ form
```

### 5.2 Review Session Flow (Duolingo-style)

```
1. User click "Ôn tập" → POST /api/rse/review-sessions/ → tạo session
2. GET /api/srs/card-srs/?due_date__lte=today → lấy cards cần ôn
3. Hiển thị full-screen mode:
   - Show front → User flip → Show back
   - User chọn: EASY ✅ | GOOD 👍 | HARD ❌
   - Animation phản hồi (xanh/đỏ)
   - POST /api/rse/card-review-logs/ (ghi log)
   - Progress bar cập nhật
4. Hết card → Hiển thị result screen:
   - Số card đã ôn, accuracy, XP earned
   - PATCH /api/rse/review-sessions/{id}/ (set ended_at)
```

### 5.3 Speaking Flow

```
1. User chọn topic → POST /api/sps/sessions/ → tạo session
2. Full-screen chat UI:
   - AI gửi opening message
   - User record audio → POST /api/sps/speak/ (audio file)
   - AI response (text + audio)
   - Chat bubble animation
3. Kết thúc → Summary + XP
```

---

## 6. Responsive Strategy

| Breakpoint | Chiều rộng | Layout |
|------------|-----------|--------|
| **Mobile** | < 768px | Sidebar ẩn (hamburger), 1 column |
| **Tablet** | 768px – 1024px | Sidebar collapsed (icon only), 1-2 column |
| **Desktop** | > 1024px | Full sidebar, 2-3 column content |

**CSS Media Query approach (không dùng framework):**
```css
/* Mobile first */
.container { padding: var(--space-4); }

@media (min-width: 768px) {
  .container { padding: var(--space-6); }
}

@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

---

## 7. Tasks Breakdown

### Phase 1: Foundation (P0)

- [ ] **T1: Khởi tạo project** → `npm create vite@latest memo-fe -- --template react` + cài dependencies (`antd`, `@reduxjs/toolkit`, `react-redux`, `react-router-dom`, `axios`, `clsx`) → Verify: `npm run dev` chạy thành công
- [ ] **T2: Setup Design System** → `variables.css` (palette), `global.css`, `reset.css`, `animations.css`, Ant Design theme config, import font Inter → Verify: Mở browser thấy font Inter + màu primary đúng
- [ ] **T3: Redux Store + Axios Client** → `store.js` (Redux config), `axiosClient.js` (baseURL, token interceptor, auto refresh 401, mutex queue) → Verify: Console log store state, test interceptor gắn token
- [ ] **T4: Routing + Layout** → React Router config, `MainLayout` (sidebar + header, CSS Modules), `ProtectedRoute` → Verify: Navigate giữa các routes, sidebar hiển thị đúng

### Phase 2: Core Features (P0)

- [ ] **T5: Auth (Login/Register)** → `authSlice` + `authService.js` (Axios), Login/Register pages (CSS Modules), JWT persist localStorage → Verify: Đăng nhập thành công, redirect /dashboard, reload giữ session
- [ ] **T6: Dashboard** → Daily goal widget, streak counter, recent activity, XP badge (tất cả hỗ trợ style props) → Verify: Dashboard hiển thị data từ API
- [ ] **T7: Course module** → `courseService.js`, Courses list, course detail, lesson video player, progress tracking → Verify: Xem video, progress cập nhật khi đủ 2 phút
- [ ] **T8: Flashcard module** → `flashcardService.js`, Folder CRUD, Flashcard CRUD, card form (front/back/ipa/image) → Verify: Tạo folder → tạo card → hiển thị list

### Phase 3: Learning Engine (P0-P1)

- [ ] **T9: Review Session** → `reviewService.js`, full-screen review mode, card flip animation, EASY/GOOD/HARD buttons, progress bar, result screen → Verify: Ôn tập flow hoàn chỉnh, XP cộng đúng
- [ ] **T10: Speaking Practice** → `speakingService.js`, topic selection, audio recorder, chat UI, AI response display → Verify: Record audio → nhận AI response → multi-turn conversation

### Phase 4: Gamification & Polish (P1-P2)

- [ ] **T11: Leaderboard + Profile** → Rankings page, profile stats (XP, streak, history chart) → Verify: Leaderboard sorted đúng
- [ ] **T12: Admin pages** → Course management (CRUD) cho teacher/admin → Verify: Teacher tạo/sửa course thành công
- [ ] **T13: Responsive + Polish** → Test responsive tất cả pages, animations, loading states, error handling → Verify: Responsive test 375px / 768px / 1024px / 1440px
- [ ] **T14: Deploy Vercel** → `vercel.json` rewrites config, env variables, build test → Verify: `npm run build` thành công, deploy Vercel preview OK

### Phase X: Verification

- [ ] Tất cả pages render không lỗi console
- [ ] Auth flow hoàn chỉnh (login → use → token refresh → re-login)
- [ ] Review session flow end-to-end
- [ ] Responsive test trên 4 breakpoints
- [ ] `npm run build` thành công (0 errors)
- [ ] Deploy Vercel production

---

## 8. Quyết Định Thiết Kế Frontend

| # | Quyết định | Lý do | Trade-off |
|---|-----------|-------|-----------|
| 1 | **Vite thay vì CRA/Next.js** | Nhẹ, fast HMR, không cần SSR cho SPA | Không có SSR/SEO (chấp nhận vì là app đăng nhập) |
| 2 | **Axios thay vì RTK Query/Fetch** | Interceptor mạnh (auto refresh JWT), cancel request, progress upload | Cần tự quản lý loading/caching trong Redux |
| 3 | **CSS Modules** (`.module.css`) | Scoped class names, không conflict, vẫn viết CSS thuần | Cần import styles object trong JSX |
| 4 | **Component Style Props** | Cho phép customize component qua props (className, style, color...) | Cần thiết kế prop API cẩn thận |
| 5 | **Ant Design** | Component rich, form/table sẵn, theme token mạnh | Bundle size lớn (~300KB gzipped) – cần tree-shaking |
| 6 | **Feature-based folder** | Dễ tìm file, mỗi feature tự chứa đủ slice + service + pages | Shared components cần extract cẩn thận |
| 7 | **Full-screen cho Review/Speaking** | Tập trung học tập, giống Duolingo, ít distraction | Cần xử lý navigation back/exit |

---

## 9. Lưu Ý Phát Triển

> [!IMPORTANT]
> **CSS Modules convention:** Mọi component file đi kèm `*.module.css`. Import dạng `import styles from './X.module.css'`. Không dùng CSS thuần trừ file trong `styles/` (global).

> [!IMPORTANT]
> **Component Style Props:** Mọi shared component trong `components/` **bắt buộc** nhận `className` và `style` props. Dùng `clsx` để merge class names.

> [!WARNING]
> **Axios token refresh:** `axiosClient.js` đã implement mutex pattern – khi nhiều request đồng thời bị 401, chỉ refresh 1 lần, queue các request còn lại.

- **Ant Design tree-shaking:** Import `import { Button } from 'antd'` – Vite + antd v5 auto tree-shaking
- **Service pattern:** Mỗi feature có `*Service.js` chứa Axios calls. Component gọi service → dispatch Redux action (hoặc dùng `createAsyncThunk`)
- **Active time tracking:** `useActiveTime` hook – visibility API + interaction events, gửi lên server mỗi 30s
- **Flashcard images:** Upload lên S3/MinIO qua backend, frontend gửi file via `FormData` + Axios
- **Audio recording:** `MediaRecorder` API, gửi blob qua Axios `multipart/form-data`
- **Animations:** `@keyframes` trong `animations.css`, ưu tiên GPU-accelerated (`transform`, `opacity`)
- **Dependencies cần cài:**
  ```bash
  npm install antd @reduxjs/toolkit react-redux react-router-dom axios clsx
  ```
- **Vercel config:**
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

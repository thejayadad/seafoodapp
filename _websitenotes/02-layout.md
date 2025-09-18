Dockside Bites — Hour 2 (Frontend First): Header + Auth (SSR-first)

What we built
-------------
1) Top header (SSR) with Brand, NoticeBar, Desktop Nav, and Mobile Sidenav.
2) Modular authentication actions (server) + buttons with pending spinner.
3) Mobile drawer using DaisyUI (no JS), with crisp Lucide icons.
4) Kept the app SSR-first; the only client code is the tiny button that shows a loading spinner.

Folder & Files
--------------
lib/
└─ actions/
   └─ auth.ts                      # server actions for sign-in/out

src/app/_components/auth/
├─ AuthButton.tsx                  # tiny client button using useFormStatus() for pending state
├─ AuthNav.tsx                     # SSR: chooses Sign in / Sign out for desktop
└─ AuthNavMobile.tsx               # SSR: same, but sized for the mobile drawer

src/app/_components/header/
├─ Header.tsx                      # SSR header that composes everything
├─ Sidenav.tsx                     # SSR mobile drawer (DaisyUI + Lucide icons)
├─ NoticeBar.tsx                   # thin site-wide notice
└─ Brand.tsx                       # brand link / wordmark

Key Notes
---------
- JR: Server actions + <form> keep auth on the server. Spinner is handled with a small client button.
- SR: SSR decides auth state (no flicker). Drawer uses DaisyUI drawer pattern (checkbox hack), Lucide icons for crisp sizing. Only client code is the pending UX.

How to test
-----------
1) Start the app: npm run dev
2) On desktop: click “Log In or Sign Up” → spinner appears while Auth.js runs.
3) On mobile: open drawer → use auth button there.
4) After auth, header switches to “Sign out” (SSR-rendered state).

Next
----
- Add Pickup/Delivery segmented control (SSR, GET params).
- Build Order page sections and item detail.
- Integrate Stripe (server action + webhook).

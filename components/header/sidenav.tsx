// src/app/_components/header/Sidenav.tsx
import Link from "next/link";
import { Menu, X, UserRound } from "lucide-react";
import AuthNavMobile from "./authnav-mobile";

/**
 * Mobile sidenav (SSR-only)
 * DaisyUI drawer using a checkbox (no JS). Lucide icons for crisp visuals.
 */
export default function Sidenav() {
  return (
    <div className="drawer-end lg:hidden">
      {/* toggle target */}
      <input id="nav-drawer" type="checkbox" className="drawer-toggle" />

      {/* trigger button */}
      <label
        htmlFor="nav-drawer"
        className="btn btn-ghost btn-circle p-2"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </label>

      {/* slide-over */}
      <div className="drawer-side z-50">
        {/* overlay closes the drawer on click */}
        <label htmlFor="nav-drawer" className="drawer-overlay" aria-label="Close menu" />
        <aside className="w-80 bg-base-100 min-h-full">
          {/* header row inside the drawer */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="text-base font-medium">Good afternoon</div>
            <label
              htmlFor="nav-drawer"
              className="btn btn-ghost btn-circle p-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </label>
          </div>

          <div className="p-1">
            {/* auth action */}
            <div className="mb-4">
             <AuthNavMobile />
            </div>

       
          </div>
        </aside>
      </div>
    </div>
  );
}

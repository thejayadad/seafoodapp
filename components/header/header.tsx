// src/app/_components/header/Header.tsx
import Link from "next/link";
import Brand from "../ui/logo";
import Sidenav from "./sidenav";
import AuthNav from "./auth-nav";
import StoreStatus from "../ui/store-status";

export default async function Header() {
  return (
 <header className="sticky top-0 z-10 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80 border-b border-neutral-200">
      <div className="mx-auto max-w-7xl h-16 px-3 sm:px-4 lg:px-6 flex items-center">
        <div className="flex-1">
          <Brand />
        </div>


        <div className="flex items-center gap-1">
          <div className="hidden lg:block">
              <AuthNav />
          </div>
            <StoreStatus
            openHour={11}
            closeHour={23}
            />

          <Sidenav />
        </div>
      </div>
    </header>
  );
}

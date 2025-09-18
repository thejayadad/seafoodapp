// src/app/_components/header/Header.tsx
import Link from "next/link";
import Brand from "../ui/logo";
import Sidenav from "./sidenav";
import AuthNav from "./auth-nav";

export default async function Header() {
  return (
    <header className="w-full border-b border-neutral-200 bg-base-100">
      <div className="mx-auto max-w-7xl h-16 px-3 sm:px-4 lg:px-6 flex items-center">
        <div className="flex-1">
          <Brand />
        </div>


        {/* right: auth + mobile burger */}
        <div className="flex items-center gap-1">
          {/* Server-rendered auth; button itself handles pending in the client */}
          <div className="hidden lg:block">
            <AuthNav />
          </div>

          {/* Mobile burger → your existing Sidenav component */}
          <Sidenav />
        </div>
      </div>
    </header>
  );
}

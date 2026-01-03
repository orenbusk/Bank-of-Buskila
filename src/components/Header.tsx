"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-bud-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Buskila Dollars
        </Link>
        {session?.user && (
          <div className="flex items-center gap-4">
            <span className="text-bud-100">
              {session.user.name}
              {session.user.role === "admin" && (
                <span className="ml-2 px-2 py-0.5 bg-bud-700 rounded text-xs">
                  Admin
                </span>
              )}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 bg-bud-700 hover:bg-bud-800 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

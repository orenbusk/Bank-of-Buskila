"use client";

import { BalanceCard } from "./BalanceCard";
import Link from "next/link";

interface Kid {
  id: string;
  name: string;
  balance: number;
}

interface KidsListProps {
  kids: Kid[];
  currentUserId?: string;
}

export function KidsList({ kids, currentUserId }: KidsListProps) {
  if (kids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No other kids yet</div>
    );
  }

  // Sort by balance descending
  const sortedKids = [...kids].sort((a, b) => b.balance - a.balance);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedKids.map((kid, index) => (
        <Link
          key={kid.id}
          href={`/kid/${kid.id}`}
          className="block hover:scale-105 transition-transform"
        >
          <div className="relative">
            {index < 3 && (
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg font-bold z-10">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </div>
            )}
            <BalanceCard
              balance={kid.balance}
              name={kid.id === currentUserId ? `${kid.name} (You)` : kid.name}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}

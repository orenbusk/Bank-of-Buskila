import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { KidsList } from "@/components/KidsList";
import { ProductStore } from "./ProductStore";

// Get the last Saturday at 23:59 (weekly reset time)
function getLastSaturdayReset(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();

  let daysSinceSaturday: number;
  if (dayOfWeek === 6) {
    const saturdayReset = new Date(now);
    saturdayReset.setHours(23, 59, 0, 0);
    if (now >= saturdayReset) {
      daysSinceSaturday = 0;
    } else {
      daysSinceSaturday = 7;
    }
  } else {
    daysSinceSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
  }

  const lastSaturday = new Date(now);
  lastSaturday.setDate(now.getDate() - daysSinceSaturday);
  lastSaturday.setHours(23, 59, 0, 0);

  return lastSaturday;
}

// Get the next Saturday at 23:59
function getNextSaturdayReset(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();

  let daysUntilSaturday: number;
  if (dayOfWeek === 6) {
    const saturdayReset = new Date(now);
    saturdayReset.setHours(23, 59, 0, 0);
    if (now >= saturdayReset) {
      daysUntilSaturday = 7;
    } else {
      daysUntilSaturday = 0;
    }
  } else {
    daysUntilSaturday = 6 - dayOfWeek;
  }

  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  nextSaturday.setHours(23, 59, 0, 0);

  return nextSaturday;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { product: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const otherKids = await prisma.user.findMany({
    where: { role: "kid", approved: true },
    select: { id: true, name: true, balance: true },
  });

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  // Get this week's purchases for the user
  const lastReset = getLastSaturdayReset();
  const thisWeekPurchases = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "purchase",
      productId: { not: null },
      createdAt: { gte: lastReset },
    },
    select: { productId: true },
  });

  const purchasedThisWeek = thisWeekPurchases
    .map((t) => t.productId)
    .filter((id): id is string => id !== null);

  const nextReset = getNextSaturdayReset();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Hey, {user.name}!
          </h1>
          <BalanceCard balance={user.balance} large />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Buy Something
            </h2>
            <ProductStore
              products={products}
              balance={user.balance}
              purchasedThisWeek={purchasedThisWeek}
              nextResetDate={nextReset.toISOString()}
            />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Transactions
            </h2>
            <div className="bg-white rounded-xl shadow-sm p-4 max-h-96 overflow-y-auto">
              <TransactionHistory transactions={user.transactions} />
            </div>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Leaderboard
          </h2>
          <KidsList kids={otherKids} currentUserId={session.user.id} />
        </section>
      </main>
    </div>
  );
}

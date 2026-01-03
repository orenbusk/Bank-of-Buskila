import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { KidsList } from "@/components/KidsList";
import { ProductStore } from "./ProductStore";

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
            <ProductStore products={products} balance={user.balance} />
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

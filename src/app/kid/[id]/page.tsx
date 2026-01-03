import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function KidProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const kid = await prisma.user.findUnique({
    where: { id: params.id, role: "kid", approved: true },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { product: true },
      },
    },
  });

  if (!kid) {
    notFound();
  }

  const isOwnProfile = session.user.id === kid.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={session.user.role === "admin" ? "/admin" : "/dashboard"}
          className="inline-flex items-center text-bud-600 hover:text-bud-700 mb-6"
        >
          ← Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {isOwnProfile ? "Your Profile" : `${kid.name}'s Profile`}
          </h1>
          <BalanceCard balance={kid.balance} name={kid.name} large />
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Transaction History
          </h2>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <TransactionHistory transactions={kid.transactions} />
          </div>
        </section>
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { formatBUD } from "@/lib/utils";
import { AllowanceButton } from "./AllowanceButton";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const [kids, products, pendingCount, recentTransactions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "kid", approved: true },
      select: { id: true, name: true, balance: true },
      orderBy: { balance: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    }),
    prisma.user.count({ where: { approved: false } }),
    prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, product: true },
    }),
  ]);

  const totalBUD = kids.reduce((sum, kid) => sum + kid.balance, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Kids" value={kids.length} />
          <StatCard title="Total BUD" value={formatBUD(totalBUD)} />
          <StatCard title="Products" value={products.length} />
          <StatCard
            title="Pending Approvals"
            value={pendingCount}
            highlight={pendingCount > 0}
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-bud-500"
          >
            <h2 className="text-lg font-semibold text-gray-800">Manage Kids</h2>
            <p className="text-gray-600">Add, edit, or adjust balances</p>
          </Link>
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h2 className="text-lg font-semibold text-gray-800">Manage Products</h2>
            <p className="text-gray-600">Set prices and availability</p>
          </Link>
          <Link
            href="/admin/pending"
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-yellow-500 relative"
          >
            <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
            <p className="text-gray-600">Approve new accounts</p>
            {pendingCount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                {pendingCount}
              </span>
            )}
          </Link>
          <AllowanceButton />
        </div>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {recentTransactions.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No activity yet</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {tx.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tx.description}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-medium ${
                          tx.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatBUD(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-sm ${
        highlight ? "ring-2 ring-red-500" : ""
      }`}
    >
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

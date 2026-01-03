import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { UserManagement } from "./UserManagement";
import Link from "next/link";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    include: { allowanceConfig: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-bud-600 hover:text-bud-700 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Users</h1>

        <UserManagement users={users} />
      </main>
    </div>
  );
}

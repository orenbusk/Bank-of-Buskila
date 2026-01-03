import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { PendingApprovals } from "./PendingApprovals";
import Link from "next/link";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const pendingUsers = await prisma.user.findMany({
    where: { approved: false },
    orderBy: { createdAt: "desc" },
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

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Pending Approvals
        </h1>

        <PendingApprovals users={pendingUsers} />
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-bud-50 to-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-bud-700">Buskila Dollars</h1>
        <p className="text-xl text-gray-600">Family Allowance Tracker</p>
        <p className="text-3xl">💰</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-bud-600 text-white rounded-lg font-semibold hover:bg-bud-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border-2 border-bud-600 text-bud-600 rounded-lg font-semibold hover:bg-bud-50 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}

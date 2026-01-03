import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import Link from "next/link";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, password: true },
  });

  if (!user) {
    redirect("/login");
  }

  const hasPassword = !!user.password;
  const backUrl = session.user.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href={backUrl}
          className="inline-flex items-center text-bud-600 hover:text-bud-700 mb-6"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile</h2>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {hasPassword ? "Change Password" : "Set Password"}
          </h2>
          <ChangePasswordForm hasExistingPassword={hasPassword} />
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bud-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Awaiting Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been created and is waiting for admin approval.
          You&apos;ll be able to sign in once approved.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-bud-600 text-white rounded-lg font-semibold hover:bg-bud-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface PendingApprovalsProps {
  users: User[];
}

export function PendingApprovals({ users }: PendingApprovalsProps) {
  const router = useRouter();

  const handleApprove = async (userId: string) => {
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, approved: true }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Are you sure you want to reject this account? This will delete the account.")) {
      return;
    }
    try {
      await fetch(`/api/users/${userId}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          All caught up!
        </h2>
        <p className="text-gray-600">No pending approvals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Requested
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

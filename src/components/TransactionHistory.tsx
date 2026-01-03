"use client";

import { formatBUD, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  product?: { name: string } | null;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  showUser?: boolean;
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                tx.amount > 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {tx.type === "allowance" && "💰"}
              {tx.type === "purchase" && "🛒"}
              {tx.type === "adjustment" && "✏️"}
            </div>
            <div>
              <p className="font-medium text-gray-800">{tx.description}</p>
              <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
            </div>
          </div>
          <span
            className={`font-bold ${
              tx.amount > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {tx.amount > 0 ? "+" : ""}
            {formatBUD(tx.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

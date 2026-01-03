import { formatBUD } from "@/lib/utils";

interface BalanceCardProps {
  balance: number;
  name?: string;
  large?: boolean;
}

export function BalanceCard({ balance, name, large = false }: BalanceCardProps) {
  return (
    <div className={`bg-gradient-to-br from-bud-500 to-bud-600 rounded-xl text-white shadow-lg ${large ? "p-8" : "p-4"}`}>
      {name && (
        <p className={`text-bud-100 ${large ? "text-lg" : "text-sm"}`}>{name}</p>
      )}
      <p className={`font-bold ${large ? "text-5xl" : "text-2xl"}`}>
        {formatBUD(balance)}
      </p>
      {large && <p className="text-bud-200 mt-2">Current Balance</p>}
    </div>
  );
}

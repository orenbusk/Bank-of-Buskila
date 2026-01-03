"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AllowanceButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!confirm("Process allowances for all kids now?")) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/allowance/process", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process allowances");
      }

      setResult(
        `Processed: ${data.results.processed}, Skipped: ${data.results.skipped}, Errors: ${data.results.errors}`
      );
      router.refresh();
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Error processing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
      <h2 className="text-lg font-semibold text-gray-800">Process Allowances</h2>
      <p className="text-gray-600 mb-4">Manually trigger allowance distribution</p>
      <button
        onClick={handleProcess}
        disabled={loading}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Run Now"}
      </button>
      {result && (
        <p className="mt-2 text-sm text-gray-600">{result}</p>
      )}
    </div>
  );
}

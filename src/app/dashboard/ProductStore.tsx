"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductList } from "@/components/ProductList";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
}

interface ProductStoreProps {
  products: Product[];
  balance: number;
  purchasedThisWeek: string[];
  nextResetDate: string;
}

export function ProductStore({ products, balance, purchasedThisWeek, nextResetDate }: ProductStoreProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const handlePurchase = async (productId: string) => {
    setError("");
    try {
      const res = await fetch("/api/transactions/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Purchase failed");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <ProductList
        products={products}
        balance={balance}
        onPurchase={handlePurchase}
        purchasedThisWeek={purchasedThisWeek}
        nextResetDate={nextResetDate}
      />
    </div>
  );
}

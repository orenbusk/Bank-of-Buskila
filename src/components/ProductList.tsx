"use client";

import { useState } from "react";
import { formatBUD } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
}

interface ProductListProps {
  products: Product[];
  balance: number;
  onPurchase?: (productId: string) => Promise<void>;
  isAdmin?: boolean;
}

export function ProductList({
  products,
  balance,
  onPurchase,
  isAdmin = false,
}: ProductListProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (productId: string) => {
    if (!onPurchase) return;
    setPurchasing(productId);
    try {
      await onPurchase(productId);
    } finally {
      setPurchasing(null);
    }
  };

  const activeProducts = products.filter((p) => p.active || isAdmin);

  if (activeProducts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeProducts.map((product) => {
        const canAfford = balance >= product.price;
        return (
          <div
            key={product.id}
            className={`bg-white border rounded-xl p-4 shadow-sm ${
              !product.active ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-800">
                {product.name}
              </h3>
              {!product.active && (
                <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                  Inactive
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-bud-600">
                {formatBUD(product.price)}
              </span>
              {onPurchase && product.active && (
                <button
                  onClick={() => handlePurchase(product.id)}
                  disabled={!canAfford || purchasing === product.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canAfford
                      ? "bg-bud-600 text-white hover:bg-bud-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {purchasing === product.id
                    ? "..."
                    : canAfford
                    ? "Buy"
                    : "Not enough BUD"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

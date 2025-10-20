// src/app/dashboard/products/ProductsView.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  pricePerUnit: number;
  currency: string;
  unitOfMeasure: string;
  quantityAvailable: number;
  status: string;
  imagesUrls: string[] | null;
  _count: { orderItems: number; reviews: number };
};

export default function ProductsView({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isPending, startTransition] = useTransition();

  function getStatusColor(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "SoldOut":
        return "bg-red-100 text-red-800";
      case "Deleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const res = await fetch(`/api/products/${productId}/delete`, { method: "DELETE" });
    if (res.ok) {
      startTransition(() => {
        // Refresh the page data after deletion
        window.location.reload();
      });
    } else {
      alert("Erro ao excluir produto");
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Nenhum produto cadastrado
        </h3>
        <p className="text-gray-600 mb-6">
          Comece criando seu primeiro produto para vender na plataforma
        </p>
        <Link href="/dashboard/products/new">
          <Button className="bg-green-600 hover:bg-green-700">Criar Primeiro Produto</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex justify-end mb-4 space-x-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => setViewMode("table")}
        >
          📋 Tabela
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          onClick={() => setViewMode("cards")}
        >
          🗂️ Cards
        </Button>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preço
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estoque
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        {product.imagesUrls && product.imagesUrls.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imagesUrls[0] as string}
                            alt={product.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.title}</div>
                        <div className="text-sm text-gray-500">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {product.pricePerUnit} {product.currency}/{product.unitOfMeasure}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {product.quantityAvailable} {product.unitOfMeasure}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {product._count.orderItems} pedidos
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300"
                        onClick={() => handleDelete(product.id)}
                        disabled={isPending}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Cards view
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{product.title}</h3>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      ✏️
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    disabled={isPending}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{product.category}</p>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  {product.pricePerUnit} {product.currency}/{product.unitOfMeasure}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {product._count.orderItems} pedidos • {product._count.reviews} avaliações
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

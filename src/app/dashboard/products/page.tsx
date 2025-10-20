// src/app/dashboard/products/page.tsx
export const dynamic = "force-dynamic";

import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductsView from "./ProductsView";

// Server component: fetches data and renders stats, passes products to client component
export default async function DashboardProductsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "PRODUCER") redirect("/dashboard");

  const products = await db.productListing.findMany({
    where: { producerId: session.user.id },
    include: {
      _count: { select: { orderItems: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const totalOrders = products.reduce((sum, p) => sum + p._count.orderItems, 0);
  const totalRevenue = products.reduce(
    (sum, p) => sum + p.pricePerUnit * (p._count.orderItems || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
          <p className="text-gray-600">Gerencie suas listagens de produtos</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-green-600 hover:bg-green-700">+ Novo Produto</Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-800">{totalProducts}</div>
            <div className="text-sm text-gray-600 mt-1">Total de Produtos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{activeProducts}</div>
            <div className="text-sm text-gray-600 mt-1">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{totalOrders}</div>
            <div className="text-sm text-gray-600 mt-1">Pedidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {totalRevenue.toFixed(0)} AOA
            </div>
            <div className="text-sm text-gray-600 mt-1">Receita Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Products List with toggleable views and delete action */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsView products={products} />
        </CardContent>
      </Card>
    </div>
  );
}

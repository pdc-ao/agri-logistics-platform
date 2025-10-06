// src/app/dashboard/products/page.tsx
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardProductsPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || user.role !== 'PRODUCER') {
    redirect('/dashboard');
  }

  // Fetch user's products
  const products = await db.productListing.findMany({
    where: {
      producerId: session.user.id
    },
    include: {
      _count: {
        select: {
          orderItems: true,
          reviews: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'Active').length;
  const totalOrders = products.reduce((sum, p) => sum + p._count.orderItems, 0);
  const totalRevenue = products.reduce((sum, p) => 
    sum + (p.pricePerUnit * (p._count.orderItems || 0)), 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'SoldOut': return 'bg-red-100 text-red-800';
      case 'Deleted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meus Produtos</h1>
          <p className="text-gray-600">Gerencie suas listagens de produtos</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-green-600 hover:bg-green-700">
            + Novo Produto
          </Button>
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

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando seu primeiro produto para vender na plataforma
              </p>
              <Link href="/dashboard/products/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  Criar Primeiro Produto
                </Button>
              </Link>
            </div>
          ) : (
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
                            {product.imagesUrls && Array.isArray(product.imagesUrls) && product.imagesUrls.length > 0 ? (
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
                            <div className="font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.description.substring(0, 50)}...
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
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product, PaginatedProductsResponse, ApiError } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [page, setPage] = useState(0);
  const [limit] = useState(0); // keep 0 for legacy. Set 12 to enable pagination.
  const [paginationMeta, setPaginationMeta] = useState<PaginatedProductsResponse['pagination'] | null>(null);

  const categories = [
    'Cereais', 'Frutas', 'Vegetais', 'Legumes', 'Tubérculos', 
    'Especiarias', 'Oleaginosas', 'Bebidas', 'Outros'
  ];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sort, page]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (search) params.append('q', search);
      if (sort) params.append('sort', sort);
      if (limit > 0) {
        params.append('page', page.toString());
        params.append('limit', limit.toString());
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: Product[] | PaginatedProductsResponse | ApiError = await response.json();
      setRawResponse(data);

      if (!response.ok) {
        setError((data as ApiError)?.error || 'Erro ao carregar produtos');
        setProducts([]);
        setPaginationMeta(null);
        return;
      }

      if (Array.isArray(data)) {
        setProducts(data);
        setPaginationMeta(null);
      } else if ('data' in data && Array.isArray(data.data)) {
        setProducts(data.data);
        setPaginationMeta(data.pagination);
      } else {
        setError('Formato de resposta inesperado');
        setProducts([]);
        setPaginationMeta(null);
      }
    } catch (e) {
      console.error(e);
      setError('Falha na requisição');
      setProducts([]);
      setPaginationMeta(null);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setSelectedCategory('');
    setSearch('');
    setSort('date_desc');
    setPage(0);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Produtos Disponíveis</h1>
        <p className="text-gray-600">Encontre os melhores produtos agrícolas diretamente dos produtores</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas as Categorias</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="date_desc">Mais Recentes</option>
            <option value="date_asc">Mais Antigos</option>
            <option value="price_asc">Preço (↑)</option>
            <option value="price_desc">Preço (↓)</option>
            <option value="qty_desc">Quantidade (↑)</option>
            <option value="qty_asc">Quantidade (↓)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedCategory === '' && !search ? 'default' : 'outline'}
            onClick={resetFilters}
            className="flex-1"
          >
            Limpar
          </Button>
          <Button onClick={() => { setPage(0); fetchProducts(); }} className="flex-1 bg-green-600 hover:bg-green-700">
            Buscar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <details className="mt-2 text-xs text-gray-500">
            <summary>Debug</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">Ajuste os filtros ou tente novamente mais tarde.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">{product.title}</CardTitle>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.producer.averageRating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{product.producer.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disponível:</span>
                    <span className="font-medium">
                      {product.quantityAvailable} {product.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preço:</span>
                    <span className="font-semibold text-green-600">
                      {product.pricePerUnit} {product.currency}/{product.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produtor:</span>
                    <span className="font-medium">
                      {product.producer.fullName || product.producer.username}
                    </span>
                  </div>
                  {product.locationAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Local:</span>
                      <span className="text-sm truncate">{product.locationAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Ver Detalhes</Button>
                  <Button variant="outline" className="flex-1">Contactar</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {paginationMeta && paginationMeta.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-4 items-center">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page + 1} de {paginationMeta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page + 1 >= paginationMeta.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Próxima →
          </Button>
        </div>
      )}
    </div>
  );
}